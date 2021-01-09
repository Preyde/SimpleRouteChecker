export const pause = async (t: number) => new Promise<number>(resolve => setTimeout(() => resolve(t), t))

export function makeLines(length: number) {
    let output = ""
    for (let i = 0; i < length; i++) {
        output += " "
    }
    return output
}

export const getLongestString = (arr: string[]) => arr.reduce((p, c) => c.length > p.length ? c : p)