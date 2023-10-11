import {
  BaseSource,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddu_vim@v3.6.0/types.ts";
import { Denops, fn } from "https://deno.land/x/ddu_vim@v3.6.0/deps.ts";
import { assert, is } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";

type Params = Record<never, never>;

export class Source extends BaseSource<Params> {
  override kind = "vim_type";

  override gather(args: {
    denops: Denops;
    sourceOptions: SourceOptions;
    sourceParams: Params;
  }): ReadableStream<Item[]> {
    return new ReadableStream<Item[]>({
      async start(controller) {
        controller.enqueue(
          await getAutocmd(args.denops),
        );
        controller.close();
      },
    });
  }

  override params(): Params {
    return {};
  }
}

async function getAutocmd(denops: Denops) {
  const items: Item[] = [];
  const eventItems = await fn.getcompletion(
    denops,
    "",
    "event",
  );
  assert(eventItems, is.ArrayOf(is.String));
  for (
    const item of eventItems
  ) {
    const value = await fn.execute(
      denops,
      "autocmd " + item,
    );
    items.push({
      word: item,
      action: {
        value: value,
        type: "event",
      },
    });
  }

  return items;
}
