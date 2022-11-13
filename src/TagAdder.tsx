import clsx from "clsx";
import ky from "ky";
import React, { useCallback, useEffect, useId, useState } from "react";
import useSWR from "swr";
import { buildSearchTagsUrl } from "./App";

export const Find: React.FC<{ name: string }> = ({ name }) => {
  const { isValidating, data } = useSWR(
    buildSearchTagsUrl(name),
    (url) => ky.get(url).json<{ tags: { id: string; name_search: string; name_primary: string }[] }>(),
  );

  if (isValidating) return <span>LOADING</span>;
  if (!data) return null;

  return (
    <div>
      {data.tags.map(({ id, name_primary, name_search }) => (
        <div key={id}>
          <span className={clsx(["text-sm"], ["text-slate-900"])}>{name_search}</span>
          <span className={clsx(["text-sm"], ["text-slate-500"])}>{name_primary}</span>
        </div>
      ))}
    </div>
  );
};

export const Type: React.FC<{
  className?: string;
  handleChangeType(v: string): void;
}> = (
  { className, handleChangeType },
) => {
  const groupId = useId();

  return (
    <div className={clsx(className, ["grid", "grid-cols-4"], ["gap-x-2"], ["gap-y-2"])}>
      {["WORK", "CHARACTER", "MATERIAL", "STYLE", "SERIES", "MUSIC"].map((v) => (
        <label key={v} className={clsx(["flex"], ["itms-center"])}>
          <input
            type="radio"
            name={groupId}
            value={v}
            onChange={(e) =>
              handleChangeType(e.target.value)}
          >
          </input>
          <span className={clsx(["block"], ["ml-2"], ["text-sm"])}>{v}</span>
        </label>
      ))}
    </div>
  );
};

export const ExtraName: React.FC<{ handleChange(v: string[]): void }> = ({ handleChange }) => {
  const [extranames, setExtranames] = useState<string[]>([]);
  useEffect(() => {
    handleChange(extranames);
  }, [extranames]);

  return (
    <>
      <div className={clsx(["flex", "flex-col"])}>
        {extranames.map((extraname, i) => (
          <div key={i}>
            <div>
              <label>
                <span>Extraname {i + 1}</span>
                <input
                  value={extraname}
                  onChange={(e) => {
                    setExtranames((prev) => [...prev.slice(0, i), e.target.value, ...prev.slice(i + 1)]);
                  }}
                >
                </input>
              </label>
              <button
                onClick={() => {
                  setExtranames((prev) => [...prev.slice(0, i), ...prev.slice(i + 1)]);
                }}
              >
                -
              </button>
            </div>
            {extraname && <Find name={extraname} />}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          setExtranames((prev) => [...prev, ""]);
        }}
      >
        +
      </button>
    </>
  );
};

export const TagAdder: React.FC = () => {
  const [primaryName, setPrimaryName] = useState<string>("");
  const [extraNames, setExtranames] = useState<string[]>([]);
  const [type, setType] = useState<string | null>(null);

  const add = useCallback(async () => {
    if (!type) return;
    if (!primaryName) return;

    const result = await ky.post(
      `${import.meta.env.VITE_API_ENDPOINT}/tags/add`,
      {
        body: JSON.stringify({
          type,
          primary_name: primaryName,
          extra_names: extraNames.filter((v) => v !== ""),
        }),
      },
    );
    if (400 <= result.status) {
      console.log(result.statusText);
    }
  }, [primaryName, type, extraNames]);

  return (
    <div>
      <div>
        <label>
          <span>Primary Name</span>
          <input
            value={primaryName}
            onChange={(e) => {
              setPrimaryName(e.target.value);
            }}
          >
          </input>
        </label>
        {primaryName !== "" && <Find name={primaryName} />}
      </div>
      <ExtraName handleChange={(v) => setExtranames(v)}></ExtraName>
      <Type handleChangeType={(v) => setType(v)}></Type>
      <button onClick={() => add()}>ADD</button>
    </div>
  );
};
