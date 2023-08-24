import React from "react";
import {NoSSR} from "@node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-no-ssr";
import MMTDGameTest from "@app/mmtdgameTest/MMTDGameTest";

const page = () => {
    return (
        <NoSSR>
            <MMTDGameTest/>
        </NoSSR>
    )
}

export default page;