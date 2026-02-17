import { useEffect, useState } from 'react';
import api from '../api/axios';
import Hero from '../components/Hero';
import Row from '../components/Row';
import ScrollToTop from '../components/ScrollToTop';

const Home = () => {
    const [data, setData] = useState({
        heroSeries: [],
        trendingMovies: [],
        genreSeriesRows: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/series/home');
                setData(response.data);
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#141414] text-white">Loading...</div>;

    return (
        <div className="pb-20 overflow-x-hidden bg-[#0f1014] min-h-screen">
            <Hero series={data.heroSeries} />
            
            <div className="-mt-32 relative z-20 pl-4 md:pl-0 space-y-8">
                <Row title="Trending Now" data={data.trendingMovies} isAutoScroll={true} />
                
                {data.genreSeriesRows.map((genreRow, index) => (
                    <Row key={index} title={genreRow.genre} data={genreRow.series} />
                ))}
            </div>
            
            <ScrollToTop />
        </div>
    );
};

export default Home;
