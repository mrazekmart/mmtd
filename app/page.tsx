import React from "react";
import Link from 'next/link';

const Home: React.FC = () => {
    return <div>
        <h1>Home Page</h1>

        <Link href={"/mmtdgame"}>
            <button>Play MMTD</button>
        </Link>

        <Link href={"/mmtdgameTest"}>
            <button>Test MMTD</button>
        </Link>
    </div>;
}

export default Home;