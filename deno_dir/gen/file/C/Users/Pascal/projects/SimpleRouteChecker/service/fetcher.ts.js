import { encode } from "../deps.ts";
import { makeLines, pause } from "../utils/utils.ts";
import { OutputHandler } from "./output_handler.ts";
export class Fetcher {
    constructor(url, fetchOptions) {
        this._filesFound = [];
        this._routesFound = [];
        this._routesTested = 0;
        const { wordFilePath, useFileExtensions, extensionsFilePath, depth = 2 } = fetchOptions;
        this.url = url.endsWith("/") ? url : url + "/";
        this.words = this.readWordFile(wordFilePath ?? `${Deno.cwd()}/wordlists/common.txt`);
        if (useFileExtensions) {
            this.extensions = this.readWordFile(extensionsFilePath ?? `${Deno.cwd()}/wordlists/extensions_common.txt`);
        }
        this.depth = depth;
        this.slots = new Array(depth);
    }
    set onProcessFinished(fn) {
        this.processFinished = fn;
    }
    set onBeforeFetch(fn) {
        this.beforeFetch = fn;
    }
    set onRouteFound(fn) {
        this.routeFound = fn;
    }
    get routesFound() {
        return this._routesFound;
    }
    get filesFound() {
        return this._filesFound;
    }
    get routes() {
        return this.words;
    }
    get routesTested() {
        return this._routesTested;
    }
    async start() {
        for (let i = 0; i < this.depth; i++) {
            this.slots.length = 0;
            for (let j = 0; j <= i; j++) {
                this.slots.push(0);
            }
            await this.search(i);
        }
        await pause(200);
        await Deno.writeAll(Deno.stdout, encode("\r" + OutputHandler.createDateOutput() + " Finished!" + makeLines(100)));
        await pause(2000);
        this.processFinished && this.processFinished({
            routesFound: this._routesFound.length,
            filesFound: this._filesFound.length,
            routesTested: this._routesTested
        });
    }
    async search(i) {
        this.slots[i] = this.slots[i] ?? 0;
        do {
            for (let key in this.words) {
                this.slots[i] = Number(key);
                const routes = this.slots.map(slot => this.words[slot]);
                await this.fetch(routes);
                if (this.extensions)
                    await this.searchForFile(routes);
            }
            this.checkMax(i - 1);
            if (i === 0)
                break;
        } while (this.slots[0] < this.words.length);
    }
    checkMax(i) {
        if (i === -1)
            return;
        if (this.slots[i] >= this.words.length - 1 && i != 0) {
            this.slots[i] = 0;
            this.checkMax(i - 1);
        }
        this.slots[i]++;
    }
    async searchForFile(routes) {
        if (!this.extensions)
            return;
        for await (let ext of this.extensions) {
            await this.fetch(routes, ext);
        }
    }
    async fetch(routes, ext) {
        await pause(1);
        this.beforeFetch && this.beforeFetch(routes, ext);
        let requestPath = this.url + routes.join("/");
        if (ext)
            requestPath += ext;
        fetch(requestPath).then(res => {
            this._routesTested++;
            if (res.status !== 404 && res.status !== 502) {
                this._routesFound.push(requestPath);
                this.routeFound && this.routeFound(requestPath, this.url);
            }
        });
    }
    readWordFile(filePath) {
        let file = Deno.readTextFileSync(filePath);
        file = file.replace(/(\r\n|\n|\r)/gm, " ");
        return file.split(" ");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZldGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUNuQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQ3BELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQWNuRCxNQUFNLE9BQU8sT0FBTztJQTRDaEIsWUFBWSxHQUFXLEVBQUUsWUFBMEI7UUFyQzNDLGdCQUFXLEdBQWEsRUFBRSxDQUFBO1FBQzFCLGlCQUFZLEdBQWEsRUFBRSxDQUFBO1FBQzNCLGtCQUFhLEdBQUcsQ0FBQyxDQUFBO1FBcUNyQixNQUFNLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsR0FBRyxZQUFZLENBQUE7UUFFdkYsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsdUJBQXVCLENBQUMsQ0FBQTtRQUVwRixJQUFJLGlCQUFpQixFQUFFO1lBRW5CLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsa0NBQWtDLENBQUMsQ0FBQTtTQUM3RztRQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBRWxCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDakMsQ0FBQztJQXpDRCxJQUFJ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