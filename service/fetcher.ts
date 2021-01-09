import { encode } from "../deps.ts"
import { makeLines, pause } from "../utils/utils.ts"
import { OutputHandler } from "./output_handler.ts"

export interface FetchOptions {
    wordFilePath?: string
    extensionsFilePath?: string
    useFileExtensions?: boolean
    useRouteParam?: boolean
    depth?: number
}
export type ProcessResult = { routesFound: number, filesFound?: number, routesTested: number }
export type ProcessFinished = (result: ProcessResult) => void
export type BeforeFetch = (routes: string[], ext?: string) => void
export type RouteFound = (route: string, url: string) => void

export class Fetcher {

    private url: string

    private words: string[]
    private extensions?: string[]

    private _filesFound: string[] = []
    private _routesFound: string[] = []
    private _routesTested = 0

    private processFinished?: ProcessFinished
    private beforeFetch?: BeforeFetch
    private routeFound?: RouteFound
    private slots: number[]

    private depth: number

    set onProcessFinished(fn: ProcessFinished) {
        this.processFinished = fn
    }
    set onBeforeFetch(fn: BeforeFetch) {
        this.beforeFetch = fn
    }
    set onRouteFound(fn: RouteFound) {
        this.routeFound = fn
    }
    get routesFound() {
        return this._routesFound
    }

    get filesFound() {
        return this._filesFound
    }

    get routes() {
        return this.words
    }

    get routesTested() {
        return this._routesTested
    }


    constructor(url: string, fetchOptions: FetchOptions) {

        const { wordFilePath, useFileExtensions, extensionsFilePath, depth = 2 } = fetchOptions

        this.url = url.endsWith("/") ? url : url + "/"
        this.words = this.readWordFile(wordFilePath ?? `${Deno.cwd()}/wordlists/common.txt`)

        if (useFileExtensions) {

            this.extensions = this.readWordFile(extensionsFilePath ?? `${Deno.cwd()}/wordlists/extensions_common.txt`)
        }

        this.depth = depth

        this.slots = new Array(depth)
    }


    async start() {


        for (let i = 0; i < this.depth; i++) {

            this.slots.length = 0
            for (let j = 0; j <= i; j++) {
                this.slots.push(0)
            }

            await this.search(i)

        }
        await pause(200)
        await Deno.writeAll(Deno.stdout, encode("\r" + OutputHandler.createDateOutput() + " Finished!" + makeLines(100)))

        // wait for incoming fetches
        await pause(2000)

        this.processFinished && this.processFinished({
            routesFound: this._routesFound.length,
            filesFound: this._filesFound.length,
            routesTested: this._routesTested
        })

    }

    private async search(i: number) {

        this.slots[i] = this.slots[i] ?? 0

        do {

            for (let key in this.words) {
                this.slots[i] = Number(key)
                const routes = this.slots.map(slot => this.words[slot])

                await this.fetch(routes)
                if (this.extensions) await this.searchForFile(routes)


            }

            this.checkMax(i - 1)
            if (i === 0) break
        } while (this.slots[0] < this.words.length)

    }

    private checkMax(i: number) {
        if (i === -1) return

        if (this.slots[i] >= this.words.length - 1 && i != 0) {
            this.slots[i] = 0
            this.checkMax(i - 1)
        }

        this.slots[i]++
    }


    private async searchForFile(routes: string[]) {
        if (!this.extensions) return

        for await (let ext of this.extensions) {

            await this.fetch(routes, ext)


        }
    }
    private async fetch(routes: string[], ext?: string) {
        await pause(1)

        this.beforeFetch && this.beforeFetch(routes, ext)

        let requestPath = this.url + routes.join("/")


        if (ext) requestPath += ext

        fetch(requestPath).then(res => {
            this._routesTested++
            if (res.status !== 404 && res.status !== 502) {
                this._routesFound.push(requestPath)
                this.routeFound && this.routeFound(requestPath, this.url)
            }
        })
    }

    private readWordFile(filePath: string) {

        let file = Deno.readTextFileSync(filePath)

        file = file.replace(/(\r\n|\n|\r)/gm, " ");

        return file.split(" ")
    }


}