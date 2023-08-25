"use client"

import React, {useEffect, useState} from "react";
import {NoSSR} from "@node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-no-ssr";
import Game from "@app/mmtdgame/MMTDGame";

const page = () => {
    const [showTowerList, setShowTowerList] = useState(false);

    useEffect(() => {
        Game.init({containerId: 'MMTDContainer'})
            .then(() => Game.run())
    }, []);

    useEffect(() => {
        const pause = () => Game.pause();
        const resume = () => Game.resume();
        
        window.addEventListener('blur', pause);
        window.addEventListener('focus', resume);

        return () => {
            window.removeEventListener('blur', pause);
            window.removeEventListener('focus', resume);
        }
    }, []);

    const handleTowerClick = (towerType: number) => {
        Game.managers.builderMode.turnOn()
        Game.managers.builderMode.towerToPlaceType = towerType
    };

    const handleNextWaveButton = () => {
        Game.managers.wave.nextWave()
    }

    const placeTowersButton = () => {
        setShowTowerList(!showTowerList)
        Game.managers.builderMode.turnOff()
    }

    return (
        <NoSSR>
            <div>
                <div className="flex-direction-column">
                    <div className="mmtdButtonContainer">
                        <button className="mmtdButton" onClick={handleNextWaveButton}>Next Wave</button>
                        <button className="mmtdButton" onClick={placeTowersButton}>Place Towers</button>
                    </div>
                    {showTowerList && (
                        <div className="sci-fi-container">
                            <h2>Select a Tower</h2>
                            <ul className="sci-fi-button-list">
                                <li className="sci-fi-button-list-item">
                                    <button onClick={() => handleTowerClick(0)}>Basic Tower</button>
                                </li>
                                <li className="sci-fi-button-list-item">
                                    <button onClick={() => handleTowerClick(1)}>Slowing Tower</button>
                                </li>
                                <li className="sci-fi-button-list-item">
                                    <button onClick={() => handleTowerClick(2)}>Gravity Shaper Tower</button>
                                </li>
                                <li className="sci-fi-button-list-item">
                                    <button onClick={() => handleTowerClick(3)}>Lighting Strike Tower</button>
                                </li>
                                <li className="sci-fi-button-list-item">
                                    <button onClick={() => handleTowerClick(4)}>Gold Miner Tower</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                <div id="MMTDContainer"></div>
            </div>
        </NoSSR>
    )
}

export default page;
