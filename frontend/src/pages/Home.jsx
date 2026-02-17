import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Row from "../components/Row";

function Home() {
	return (
		<div className="bg-black min-h-screen">
			<Navbar />
			<Hero />
			<Row title="Trending Now" />
			<Row title="Top Rated" />
			<Row title="Continue Watching" />
		</div>
	);
}

export default Home;
