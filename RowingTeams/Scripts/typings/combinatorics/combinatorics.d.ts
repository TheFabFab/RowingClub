declare module Combinatorics {
    interface CombinatoricsStatic {
        C(m: number, n: number): number;
        P(m: number, n: number): number;
        factorial(n: number): number;
        factoradic(n: number, d?: number): number;

        permutation<T>(array: Array<T>, nelem?: number, fun?: any): IPermutationGenerator<T>;
        combination<T>(array: Array<T>, nelem?: number, fun?: any): IPermutationGenerator<T>;
        power<T>(array: Array<T>, fun?: any): IRandomAccessPermutationGenerator<T>;
        cartesianProduct<T>(...array: Array<any>): IRandomAccessPermutationGenerator<T>
    }

    interface IPermutationGenerator<T> {
        next(): Array<T>;
        forEach(action: (permutation: Array<T>) => void);
        toArray(): Array<Array<T>>;
        length: number;
    }

    interface IRandomAccessPermutationGenerator<T> extends IPermutationGenerator<T> {
        nth(n: number): Array<T>;
    }
}

declare var Combinatorics: Combinatorics.CombinatoricsStatic;
