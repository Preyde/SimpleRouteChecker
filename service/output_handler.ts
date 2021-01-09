import { encode, Colors, format } from "../deps.ts"
import { makeLines, getLongestString } from "../utils/utils.ts"
import { BeforeFetch, ProcessFinished, ProcessResult, RouteFound } from "./fetcher.ts"
import { url } from "../mod.ts"


export class OutputHandler {

    private lastOutputLength = 0
    private maxOutputLength: number

    constructor(routes: string[], private depth: number = 2) {
        this.maxOutputLength = getLongestString(routes).trimEnd().length
    }

    handleBeforeFetch: BeforeFetch = (routes: string[], ext?: string) => {

        let lUrl = url.endsWith("/") ? url.slice(0, url.length - 1) : url
        let outputText = "Searching for " + lUrl

        for (let i = 0; i < this.depth; i++) {


            const word = routes[i] || ""

            const amountToSpace = (this.maxOutputLength - word.length) / 2
            let leftFiller = 0,
                rightFiller = 0

            if (Number.isInteger(amountToSpace)) {
                leftFiller = rightFiller = amountToSpace
            } else {
                leftFiller = Math.floor(amountToSpace)
                rightFiller = Math.floor(amountToSpace + .5)
            }


            outputText += ` / [ ${makeLines(leftFiller)}${word}${makeLines(rightFiller)} ]`
        }
        if (ext) outputText += ` . [ ${ext} ]`

        const lines = ""
        this.lastOutputLength = outputText.length

        Deno.writeAllSync(Deno.stdout, encode(outputText + lines + "\r"))
    }

    handleRouteFound: RouteFound = (route: string, url: string) => {

        // console.log("\r" + OutputHandler.createDateOutput() + " found " + Colors.yellow(route) + makeLines(this.lastOutputLength))
        Deno.writeAllSync(Deno.stdout, encode("\r" + OutputHandler.createDateOutput() + " found " + Colors.yellow(route) + makeLines(this.lastOutputLength)))
    }

    handleProcessFinished: ProcessFinished = ({ routesFound, filesFound, routesTested }: ProcessResult) => {
        console.log(`\nTested ${routesTested} routes${makeLines(this.lastOutputLength)}`)
        console.log(`\rFound ${routesFound} routes${makeLines(this.lastOutputLength)}`)
        filesFound && console.log(`\rFound ${filesFound} files${makeLines(this.lastOutputLength)}`)
        console.log("")
        Deno.exit()
    }

    static logError(s: string) {
        console.log("[" + Colors.red("Error") + "] " + s)
    }

    static logWithDate(s: string) {
        console.log(this.createDateOutput() + s)
    }
    static createDateOutput = () => "[" + Colors.brightCyan(format(new Date(), "HH:mm:ss")) + "]"


}
