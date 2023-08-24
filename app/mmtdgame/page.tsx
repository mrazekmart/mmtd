import MMTDGame from "@app/mmtdgame/MMTDGame";
import React from "react";
import {NoSSR} from "@node_modules/next/dist/shared/lib/lazy-dynamic/dynamic-no-ssr";

const page = () => {
    return (
        <NoSSR>
            <MMTDGame/>
        </NoSSR>
    )
}

export default page;