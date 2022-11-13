import clsx from "clsx";
import ky from "ky";
import React, { useState } from "react";
import useSWR from "swr";

export const buildCheckNiconicoUrl = (id: string) => {
  const url = new URL(`/niconico/check/${id}`, import.meta.env.VITE_API_ENDPOINT!);
  return url.toString();
};

export const buildSearchTagsUrl = (query: string) => {
  const url = new URL(`/search`, import.meta.env.VITE_API_ENDPOINT!);
  url.searchParams.set("query", query);
  url.searchParams.set("target", "tags");

  return url.toString();
};

export const ignoreTag = (tag: string): boolean => ["音MAD"].includes(tag);

export const TagSearch: React.FC<{ tag: string }> = ({ tag: tag }) => {
  const { isValidating, data } = useSWR(
    buildSearchTagsUrl(tag),
    (url) =>
      ky.get(url).json<
        {
          "tags": {
            id: string;
            name_search: string;
            name_primary: string;
          }[];
        }
      >(),
  );

  if (isValidating) return <span>LOADING</span>;
  if (!data) return null;

  return (
    <div>
      {data.tags.map(({ id, name_primary, name_search }) => (
        <div key={id}>
          <span className={clsx(["text-slate-900"])}>{name_search}</span>
          <span className={clsx(["text-slate-500"])}>{name_primary}</span>
        </div>
      ))}
    </div>
  );
};

export const Niconico: React.FC<{ id: string }> = ({ id }) => {
  const { data, isValidating } = useSWR(
    buildCheckNiconicoUrl(id),
    (url) =>
      ky.get(url).json<{
        id: string;
        title: string;
        tags: string[];
        thumbnail_url: string;
        thumbnail_url_large: string;
      }>(),
  );

  if (isValidating) {
    return (
      <div>
        <span>Loading</span>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div>
      <img src={data.thumbnail_url_large} />
      <div className={clsx(["flex", "flex-col"])}>
        <span>{data.id}</span>
        <span>{data.title}</span>
        {data.tags.map((tag, i) => (
          <div key={i}>
            <span className={clsx(["font-bold"])}>{tag}</span>
            {!ignoreTag(tag) && <TagSearch tag={tag}></TagSearch>}
          </div>
        ))}
      </div>
    </div>
  );
};

export const IndexPage: React.FC = () => {
  const [input, setInput] = useState("sm39829973");
  const [id, setId] = useState<string | null>(null);

  return (
    <main className={clsx(["grid"], ["grid-cols-2"])}>
      <div>
        <p>niconico checker</p>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        >
        </input>
        <button
          onClick={() => {
            if (!input.startsWith("sm") && !input.startsWith("nv")) return;
            setId(input);
          }}
        >
          Check
        </button>
        {id && <Niconico id={id}></Niconico>}
      </div>
      <div>
        <p>Tag Adder</p>
        <TagAdder></TagAdder>
      </div>
    </main>
  );
};

export const App: React.FC = () => {
  return <IndexPage />;
};
