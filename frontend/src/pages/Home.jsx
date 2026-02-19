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

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#0f1014] text-white">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold tracking-widest text-red-600 animate-pulse">BINGESYNC</p>
        </div>
    );

    return (
        <div className="pb-32 overflow-x-hidden bg-[#0f1014] min-h-screen">
            <Hero series={data.heroSeries} />
            
            <div className="-mt-48 relative z-20 space-y-16">
                <div className="bg-gradient-to-t from-[#0f1014] via-[#0f1014]/80 to-transparent pt-32 -mt-32">
                    <Row title="Trending Now" data={data.trendingMovies} isAutoScroll={true} />
                </div>
                
                <div className="space-y-12">
                    {data.genreSeriesRows.map((genreRow, index) => (
                        <Row key={index} title={genreRow.genre || 'Recommended'} data={genreRow.series} />
                    ))}
                </div>
            </div>
            
            <ScrollToTop />
        </div>
    );
};

export default Home;
