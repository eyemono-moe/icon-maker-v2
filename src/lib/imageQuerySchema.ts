import * as v from "valibot";

const MAX_SIZE = 1024;

export const imageQuerySchema = v.object({
  p: v.optional(v.string()),
  f: v.optional(v.union([v.literal("png"), v.literal("svg")]), "svg"),
  s: v.optional(
    v.pipe(
      v.string(),
      v.regex(/^(\d+)(x(\d+))?$/),
      v.transform((s) => {
        const match = s.match(/^(\d+)(x(\d+))?$/);
        if (!match) {
          throw new Error("invalid size");
        }
        const [_, w, __, h] = match;
        return { w: Number.parseInt(w), h: h ? Number.parseInt(h) : undefined };
      }),
      v.check((s) => {
        if (s.w === 0 || s.h === 0) {
          return false;
        }
        if (s.w > MAX_SIZE || (s.h && s.h > MAX_SIZE)) {
          return false;
        }
        return true;
      }, "invalid size"),
    ),
  ),
});
export type ImageQueryOutput = v.InferOutput<typeof imageQuerySchema>;
