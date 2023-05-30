import React from "react";
import { Header } from "../../stories/template/Header";
import { MainBar } from "../../stories/template/MainBar";
import { PoolPanel } from "../../stories/template/PoolPanel";
import { Footer } from "../../stories/template/Footer";
import { Button } from "../../stories/atom/Button";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import "./style.css";

type User = {
  name: string;
};

const Pool = () => {
  const [user, setUser] = React.useState<User>();

  return (
    <div className="flex flex-col min-h-[100vh] w-full">
      <Header
        // user={user}
        onLogin={() => setUser({ name: "Jane Doe" })}
        onLogout={() => setUser(undefined)}
        onCreateAccount={() => setUser({ name: "Jane Doe" })}
      />
      <section className="flex flex-col grow">
        <MainBar />
        <PoolPanel />
        <article className="max-w-[680px] w-full mt-8 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <p>Token(ERC-1155) Contract Address</p>
              {/* tooltip */}
            </div>
            <div className="flex items-center gap-1">
              {/* address */}
              <p>0xdac1...432ec1</p>
              <Button iconOnly={<Square2StackIcon />} />
            </div>
          </div>
          <div className="mb-12">
            <p className="my-6 text-left text-black/30">
              Please set additional values to apply to the basic formula in
              Borrow Fee. Calculated based on open Interest and stop profit/Loss
              rate.
            </p>
            <Button label="Trade on this ETH/USDC Pool" />
          </div>
        </article>
        {/*   info bottom */}
        {/*     a - infoRow_sm? */}
        {/*     text */}
        {/*   a - Button_sm : trade on this pool */}
      </section>

      <Footer />
    </div>
  );
};

export default Pool;
