import { type NextPage } from "next";

import { api, type RouterOutputs } from "@/utils/api";
import { SignInButton, useUser } from "@clerk/nextjs";

import { LoadingPage, LoadingSpinner } from "@/components/loading";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "@/components/layout";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content?.[0];
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error(e.message);
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full items-center gap-3">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        className="h-14 w-14 rounded-full"
        height={56}
        width={56}
      />

      <input
        placeholder="Type some emoji's!"
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();

            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
      />

      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })} disabled={isPosting}>
          Post
        </button>
      )}

      {isPosting && <LoadingSpinner size={20} />}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = ({ author, post }: PostWithUser) => {
  return (
    <div
      key={post.id}
      className="flex items-center gap-3 border-b border-slate-400 p-4"
    >
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}'s profile image`}
        className="h-14 w-14 rounded-full"
        height={56}
        width={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>{`@${author.username}`}</Link>
          <Link href={`/post/${post.id}`} className="font-thin">{`· ${dayjs(
            post.createdAt
          ).fromNow()}`}</Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: isPostsLoading } = api.posts.getAll.useQuery();

  if (isPostsLoading) return <LoadingPage />;

  if (!data) return <div>Something we wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map(({ post, author }) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if user isn't loaded yet
  if (!isUserLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {isSignedIn ? (
          <CreatePostWizard />
        ) : (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <Feed />
      </div>
    </PageLayout>
  );
};

export default Home;
