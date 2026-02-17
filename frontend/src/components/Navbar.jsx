function Navbar() {
	return (
		<div className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent">
			<div className="flex items-center justify-between px-8 py-4">
				<h1 className="text-red-600 text-3xl font-bold tracking-wide">
					SeriesTracker
				</h1>

				<div className="flex gap-6 text-white text-sm font-medium">
					<p className="hover:text-gray-300 cursor-pointer">Home</p>
					<p className="hover:text-gray-300 cursor-pointer">My List</p>
					<p className="hover:text-gray-300 cursor-pointer">Trending</p>
					<p className="hover:text-gray-300 cursor-pointer">Profile</p>
				</div>
			</div>
		</div>
	);
}

export default Navbar;
