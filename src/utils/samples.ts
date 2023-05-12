import {nanoid} from 'nanoid';
export function samplesFactory(name: string, data: any) {
    return {
        name,
        data,
        key: nanoid(),
    };
}

export function initJSONSamples(json: any[]) {
    return json.map((jsonData: any, index: number) => {
        return samplesFactory(`test${index}`, jsonData);
    });
}

export function getNumberWithToFixed(fixedNumber: number = 3) {
    return Number(fixedNumber.toFixed(3));
}
