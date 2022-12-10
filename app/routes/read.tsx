import { useEffect, useRef } from "react";
import { Link, Form, useTransition, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getContentList, createContent } from "~/models/content.server";
import { requireUserId } from "~/session.server";
import { Header } from "~/components/Header";
import { cx } from "~/utils";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const url = formData.get("url");

  if (typeof url !== "string" || url.length === 0) {
    return json({ errors: { url: "Link is required" } }, { status: 400 });
  }

  const contentItem = await createContent({ url, userId });

  return contentItem;
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
  const transition = useTransition();
  const data = useLoaderData<typeof loader>();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      transition.state !== "submitting" &&
      transition.submission?.formData?.get("_action") === "create"
    ) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [transition]);

  return (
    <div className="flex min-h-full flex-col justify-start">
      <Header title={<Link to=".">Read</Link>} />
      <div className="grid grid-cols-[40px_auto_40px] py-10">
        <div className="col-start-2 col-end-3 space-y-4">
          <Form
            method="post"
            replace
            ref={formRef}
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
                  "s-translate-x-3 transform",
                  "rounded border border-solid border-transparent",
                  "text-base font-normal text-gray-600",
                  "transition ease-in-out",
                  "placeholder:italic placeholder:text-slate-500",
                  "focus:border-blue-200 focus:bg-blue-200/20 focus:text-gray-700 focus:outline-none"
                )}
              />
            </label>
            <button
              type="submit"
              name="_action"
              value="create"
              className={cx(
                "invisible group-focus-within:visible",
                "bg-blue-500 py-2 px-4 text-white ",
                "rounded hover:bg-blue-600 focus:bg-blue-400",
                "transition ease-in",
                "order-last"
              )}
            >
              Save
            </button>
            <button
              className={cx(
                "invisible group-focus-within:visible",
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
          <ul className="list-disc space-y-2 pl-3">
            {data.contentList.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx(
                    "text-blue-600 underline",
                    "hover:text-blue-900 focus:rounded focus:outline-dashed active:outline-none",
                    "transition ease-in"
                  )}
                >
                  {item.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
