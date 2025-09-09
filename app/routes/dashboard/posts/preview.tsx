import { useNavigate, useRouteError, isRouteErrorResponse, useNavigation } from "react-router";

import { ArrowLeft, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import FullScreenLoader from "~/components/allround/full-screen-loader";

import PageLayout from "../../pageLayout";
import { fetchPostById } from "~/utils/data";
import type { Route } from "../posts/+types/preview";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Post Preview" }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const id = params.postId;
  if (!id) throw new Response("Geen postID opgegeven", { status: 400 });

  try {
    const post = await fetchPostById(id);
    if (!post) throw new Response("Post niet gevonden", { status: 404 });
    return post; // plain object is fine
  } catch (err) {
    throw new Response("Kon de data niet vinden", { status: 500 });
  }
}

export function HydrateFallback() {
  return (
    <PageLayout>
      <FullScreenLoader />
    </PageLayout>
  );
}

const PreviewPost = ({ loaderData, }: Route.ComponentProps) => {
    const post = loaderData;

    const navigate = useNavigate();
    const navigation = useNavigation();
    const isPending = navigation.state === "loading" || navigation.state === "submitting";
    if (isPending) {
        return (
            <PageLayout>
                <FullScreenLoader />
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="flex flex-col w-full max-w-screen-md mx-auto px-2 md:px-4 pb-8">

                <div className="mb-6 flex flex-row md:justify-between gap-2">
                    <Button
                        className="grow md:w-fit"
                        variant="outline"
                        onClick={() => navigate(`/berichten/edit/${post.id}`, { viewTransition: true })}
                    >
                        <ArrowLeft />
                        Terug naar bewerken
                    </Button>

                    <Button
                        className="w-fit md:w-fit"
                        variant="default"
                        onClick={() => navigate(`/berichten/`, { viewTransition: true })}
                    >
                        <X />
                        Afsluiten
                    </Button>
                </div>

                {post.cover_img && (
                    <div className="w-full overflow-hidden rounded-xl shadow-md mb-8">
                        <img
                            src={post.cover_img}
                            alt={post.title}
                            className="w-full h-auto max-h-[14rem] md:max-h-[24rem] object-cover transition-transform duration-300"
                            onError={(e) => {
                                e.currentTarget.src = `https://placehold.co/800x400/CCCCCC/333333?text=Image+Not+Found`;
                            }}
                        />
                    </div>
                )}

                <div className="flex flex-col gap-2 mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                        {post.title}
                    </h1>
                    {post.published && (
                        <p className="text-sm text-muted-foreground">
                            Laatst bewerkt op <span className="font-medium">{post.published_at}</span>
                        </p>
                    )}
                </div>

                <Separator />

                <div
                    className="prose prose-neutral prose-lg md:prose-md mt-4 dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: post.description }}
                />
            </div>
        </PageLayout>
    )
}

export default PreviewPost;

export function ErrorBoundary() {
  const error = useRouteError();

  let message = "Er is iets misgelopen.";
  let status: number | undefined = undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message =
      (typeof error.data === "string" && error.data) ||
      error.statusText ||
      message;
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  return (
    <PageLayout>
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-destructive">
          {status ? `Error ${status} – ${message}` : message}
        </p>
      </div>
    </PageLayout>
  );
}