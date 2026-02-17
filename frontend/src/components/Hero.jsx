function Hero() {
	return (
		<div className="relative h-[80vh] w-full bg-[url('https://images.unsplash.com/photo-1606813902917-5f86b87d6f14')] bg-cover bg-center">
			<div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

			<div className="absolute bottom-20 left-10 text-white max-w-xl">
				<h1 className="text-5xl font-bold mb-4">The Dark Series</h1>

				<p className="text-gray-300 mb-6">
					Track your favorite shows, discover trending series, and manage your
					watchlist like never before.
				</p>

				<div className="flex gap-4">
					<button className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200">
						▶ Play
					</button>
					<button className="bg-gray-600/70 px-6 py-2 rounded font-semibold hover:bg-gray-500">
						+ My List
					</button>
				</div>
			</div>
		</div>
	);
}

export default Hero;
