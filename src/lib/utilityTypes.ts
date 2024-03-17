import type { Color } from "./color";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type OmitUndefined<T> = {
  [K in keyof T as T[K] extends undefined ? never : K]: T[K];
};
export type OmitEmptyObject<T> = {
  [K in keyof T as T[K] extends Record<string, never> ? never : K]: T[K];
};

export type OptionalProps<T> = T extends Record<string, unknown>
  ? {
      [P in keyof T as undefined | Color extends T[P] ? P : never]: T[P];
    }
  : never;

export interface ResetStore<T> {
  // 引数無しの時全ての値をリセットする
  (): void;
  // 引数有りの時指定された値をリセットする
  <K1 extends keyof T>(key: K1): void;
  <K1 extends keyof T, K2 extends keyof T[K1]>(key: K1, key2: K2): void;
}
