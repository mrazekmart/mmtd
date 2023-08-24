"use client"

import React, {useEffect} from "react";
import {initializeThreeGrid} from "@app/mmtdgameTest/MMTDGameInitializerTest";

const MMTDGameTest: React.FC = () => {

    useEffect(() => {
        initializeThreeGrid('MMTDGridMakerContainer', 50);
    }, []);


    return (
        <div>
            <div id="MMTDGridMakerContainer"></div>
        </div>
    );
}

export default MMTDGameTest;