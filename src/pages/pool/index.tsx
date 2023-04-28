import React from "react";
import { Header } from "../../stories/template/Header";
import "./style.css";

type User = {
  name: string;
};

const Pool = () => {
  const [user, setUser] = React.useState<User>();

  return (
    <div>
      <Header
        user={user}
        onLogin={() => setUser({ name: "Jane Doe" })}
        onLogout={() => setUser(undefined)}
        onCreateAccount={() => setUser({ name: "Jane Doe" })}
      />
      {/*   m - WalletDropdown */}

      {/* t - MainBar */}
      {/*   m - <MarketSelect /> */}
      {/*   MarketInfo */}
      {/*   AssetInfo */}

      {/* t - PoolPanel */}
      {/*   m - MainTab +bg */}
      {/*   a - SubTitle? : balance */}
      {/*     a - asset, price : 예치할 금액 선택 */}
      {/*   a - SubTitle : liquidity pool range */}
      {/*     text */}
      {/*     m - RangeChart */}
      {/*     m - Counter *2 */}
      {/*     a - Button : full range */}
      {/*     text */}
      {/*   a - SubTitle? : summary */}
      {/*     a - InfoRow *3 */}
      {/*     a - InfoRow_lg */}
      {/*   a - Button : deposit */}

      {/*   info bottom */}
      {/*     a - infoRow_sm? */}
      {/*     text */}
      {/*   a - Button_sm : trade on this pool */}

      {/* t - Footer */}

      <h1>Pool page</h1>
    </div>
  );
};

export default Pool;
