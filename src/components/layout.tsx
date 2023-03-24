import { type FC, type PropsWithChildren } from "react";

export const PageLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="scroll h-full w-full overflow-y-scroll border-x border-slate-400 md:max-w-2xl">
        {children}
      </div>
    </main>
  );
};
