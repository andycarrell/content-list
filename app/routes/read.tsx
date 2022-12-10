import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import {
  Link,
  Form,
  useSubmit,
  useTransition,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import {
  getContentList,
  createContent,
  updateContent,
} from "~/models/content.server";
import { requireUserId } from "~/session.server";
import { Header } from "~/components/Header";
import { cx } from "~/utils";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === "create") {
    const { url } = values;

    if (typeof url !== "string" || url.length === 0) {
      return json({ errors: { url: "Link is required" } }, { status: 400 });
    }

    return await createContent({ url, userId });
  }

  if (_action === "update") {
    const { id, checked } = values;
    const isChecked = checked === "on";

    if (typeof id !== "string") {
      return json({ errors: { id: "ID is required" } }, { status: 400 });
    }

    return await updateContent({ id, isChecked });
  }

  throw json(`Action: ${_action}, was not provided or is not recognised.`, {
    status: 400,
  });
};

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const contentList = await getContentList({ userId });

  if (!contentList) {
    throw json("Failed to load content.", { status: 500 });
  }

  const sortedContentList = [...contentList].sort(
    // sort by created_at, newest first
    (a, b) => -a.created_at.localeCompare(b.created_at)
  );

  return json({ contentList: sortedContentList });
}

export default function Read() {
  const submit = useSubmit();
  const transition = useTransition();
  const data = useLoaderData<typeof loader>();
  const inputRef = useRef<HTMLInputElement>(null);
  const createFormRef = useRef<HTMLFormElement>(null);

  function handleCheckboxChange(event: FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, { replace: true });
  }

  useEffect(() => {
    if (
      transition.state !== "submitting" &&
      transition.submission?.formData?.get("_action") === "create"
    ) {
      createFormRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [transition]);

  return (
    <div className="flex min-h-full flex-col justify-start">
      <Header title={<Link to=".">Read</Link>} />
      <div
        className={cx(
          "grid items-center py-20",
          "grid-cols-[20px_1fr_20px] sm:grid-cols-[80px_1fr_80px] lg:grid-cols-[auto_700px_auto]"
        )}
      >
        <div className="col-start-2 col-end-3 space-y-4">
          <Form
            method="post"
            replace
            ref={createFormRef}
            className="group grid grid-cols-[auto_max-content_max-content] gap-4"
          >
            <label>
              <span className="sr-only">Content link</span>
              <input
                name="url"
                ref={inputRef}
                placeholder="type link here..."
                className={cx(
                  "bg-transparent",
                  "block w-full px-3 py-1.5",
                  "rounded border border-solid border-transparent",
                  "text-base font-normal text-gray-600",
                  "placeholder:italic placeholder:text-slate-400 ",
                  "focus:border-blue-200 focus:bg-blue-200/20 focus:text-gray-700 focus:outline-none focus:placeholder:text-slate-500",
                  "transition ease-in-out"
                )}
              />
            </label>
            <button
              type="submit"
              name="_action"
              value="create"
              className={cx(
                "order-last",
                "invisible group-focus-within:visible",
                "bg-blue-500 py-2 px-4 text-white ",
                "rounded hover:bg-blue-600 focus:bg-blue-400",
                "transition ease-in"
              )}
            >
              Save
            </button>
            <button
              type="button"
              className={cx(
                "invisible group-focus-within:visible max-sm:hidden",
                "py-2 px-2 font-semibold text-slate-500 hover:text-slate-900",
                "rounded hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400",
                "transition ease-in"
              )}
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = "";
                  inputRef.current.focus();
                }
              }}
            >
              Cancel
            </button>
          </Form>
          <ul className="space-y-2 px-3">
            {data.contentList.map((item) => (
              <li key={item.id} className="">
                <Form method="post" replace onChange={handleCheckboxChange}>
                  <input name="_action" value="update" hidden readOnly />
                  <input name="id" value={item.id} hidden readOnly />
                  <label className="flex flex-row items-center gap-2 pl-px">
                    <input
                      name="checked"
                      type="checkbox"
                      defaultChecked={item.checked}
                      className={cx(
                        "peer mt-1 flex-none appearance-none self-start",
                        "checked:border-blue-500 checked:bg-blue-500 checked:outline-blue-500",
                        "h-[18px] w-[18px] cursor-pointer text-blue-600 accent-blue-500",
                        "border border-gray-400 bg-white outline outline-1 outline-gray-700 focus:ring-1 focus:ring-blue-600",
                        "transition ease-in",
                        // checkmark
                        "after:hidden after:bg-checkbox checked:after:block",
                        "after:m-px after:h-[14px] after:w-[14px] after:text-white"
                      )}
                    />
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cx(
                        "break-all px-1 text-gray-600 underline peer-checked:text-gray-600/50 peer-checked:line-through",
                        "rounded-sm hover:text-blue-900 focus:outline-none focus:ring-1 focus:ring-gray-600/60",
                        "transition duration-75 ease-in"
                      )}
                    >
                      {item.url}
                    </a>
                  </label>
                </Form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
