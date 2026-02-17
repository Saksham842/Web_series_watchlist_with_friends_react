function Row({ title }) {
	return (
		<div className="px-8 mt-8">
			<h2 className="text-white text-2xl font-semibold mb-4">{title}</h2>

			<div className="flex gap-4 overflow-x-scroll scrollbar-hide">
				{[...Array(10)].map((_, index) => (
					<div
						key={index}
						className="min-w-[200px] h-[280px] bg-gray-800 rounded-lg 
                         hover:scale-110 transition-transform duration-300 cursor-pointer"
					/>
				))}
			</div>
		</div>
	);
}

export default Row;
