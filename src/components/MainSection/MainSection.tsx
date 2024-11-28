import { GameList } from "./GameList";
import { MatchControls } from "./MatchControls";
import React from "react";
import FindMatch from "./FindMatch";

export function MainSection() {
  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GameList />
        <FindMatch />
      </div>
    </div>
  );
}
