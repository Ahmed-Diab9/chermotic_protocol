import React from "react";
import { Header } from "../../stories/template/Header";
import { MainBar } from "../../stories/template/MainBar";
import { TradePanel } from "../../stories/template/TradePanel";
import { TradeBar } from "~/stories/template/TradeBar";
import { Button } from "../../stories/atom/Button";

import "./style.css";

type User = {
  name: string;
};

const Trade = () => {
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
        <TradePanel />
        <article className="max-w-[680px] w-full mt-8 mx-auto">
          <div className="mb-12">
            <p className="my-6 text-left text-black/30">
              Please set additional values to apply to the basic formula in
              Borrow Fee. Calculated based on open Interest and stop profit/Loss
              rate.
            </p>
            <Button label="Provide Liquidity" />
          </div>
        </article>
      </section>
      <TradeBar />
    </div>
  );
};

export default Trade;
