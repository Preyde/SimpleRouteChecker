import { parse } from "./deps.ts"
import { Fetcher, FetchOptions } from "./service/fetcher.ts"
import { OutputHandler } from "./service/output_handler.ts"


const { _, h, help, p, f, a, l, R, F, d, depth } = parse(Deno.args)

export const url = _[0].toString()

if (h || help) {
    const help = await Deno.readTextFile("./help.txt")
    console.log(help)
    Deno.exit()
}


let res: Response | undefined

try {
    res = await fetch(url)
}
finally {
    if (!res || res.status === 404 || res.status === 502) {
        OutputHandler.logError(`Could not connect to ${url}`)
        Deno.exit()
    }
}

const routeFilePath = typeof R === "string" ? "./wordlists/" + R : "./wordlists/common.txt"


console.log(`\nFound ${url}`)

const fetchOptions: FetchOptions = {
    wordFilePath: routeFilePath,
    useRouteParam: p,
    depth: d || depth,
    useFileExtensions: f
}

const fetcher = new Fetcher(url, fetchOptions)

const output = new OutputHandler(fetcher.routes, d || depth)

fetcher.onBeforeFetch = output.handleBeforeFetch
fetcher.onRouteFound = output.handleRouteFound
fetcher.onProcessFinished = output.handleProcessFinished

OutputHandler.logWithDate(" Start searching for Routes...")

await fetcher.start()

if (l) {
    Deno.writeTextFile("./log.txt", fetcher.routesFound.reduce((last, current) => last + "\r" + current))
}











