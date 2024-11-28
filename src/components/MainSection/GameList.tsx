import React from 'react';
import { GameCard } from './GameCard';

export function GameList() {
  return (
    <div className="flex items-center justify-center gap-4 mt-8 px-4 md:px-8 lg:px-12">
      <GameCard 
        playerName="doublelift" 
        rank="Sweaty" 
        role="ADC"
        badges={['mvp', 'skilled', 'veteran']} 
      />
      <GameCard 
        playerName="Riot kuniso" 
        rank="Playmaker" 
        role="MID"
        badges={['skilled', 'veteran']} 
      />
      <GameCard 
        playerName="Tewtsmageswts" 
        rank="Dark Child" 
        role="JNG"
        badges={['mvp', 'skilled', 'veteran']} 
        isActive 
      />
      <GameCard 
        playerName="Barackprobama" 
        rank="One Trick" 
        role="TOP"
        badges={['veteran']} 
      />
      <GameCard 
        playerName="Julie Beanz" 
        rank="Sweet Tooth" 
        role="SUP"
        badges={['skilled']} 
      />
    </div>
  );
}