import { Award, BookOpen, Globe, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL;

const Statistics: React.FC = () => {
    const statistics = [
        { icon: BookOpen, label: "totalPosts", value: "12,456", color: "text-blue-400" },
        { icon: Users, label: "totalUsers", value: "3,892", color: "text-green-400" },
        { icon: Globe, label: "totalGeoTaggedPosts", value: "1,234", color: "text-purple-400" },
        { icon: Award, label: "totalTranslations", value: "8,765", color: "text-yellow-400" }
    ];

    const [Statistics, setStatistics] = useState(statistics);

    useEffect(() => {
        const fetchStatistics = async () => {
            try{
                const response = await fetch(`${backendApiUrl}post/public/getDashboardCounts`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if(data && data.data){
                    const updatedStatistics = statistics.map(stat => {
                        if(stat.label === "totalPosts"){
                            return { ...stat, value: data.data.totalPosts.toString() };
                        } else if(stat.label === "totalUsers"){
                            return { ...stat, value: data.data.totalUsers.toString() };
                        } else if(stat.label === "totalGeoTaggedPosts"){
                            return { ...stat, value: data.data.totalGeoTaggedPosts.toString() };
                        } else if(stat.label === "totalTranslations"){
                            return { ...stat, value: data.data.totalTranslations.toString() };
                        }
                        return stat;
                    });
                    setStatistics(updatedStatistics);
                    
                }
            } catch(error){
                console.error("Error fetching statistics:", error);
            }
        };
        fetchStatistics();
    }, []);

    return (
         <section className="py-16 bg-secondary-background/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Statistics.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <div key={index} className="text-center p-6 bg-primary-background/50 rounded-xl backdrop-blur-sm border border-slate-700/50 text-primary-text">
                    <IconComponent className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-slate-400">{stat.label}</div>
                    </div>
                );
                })}
            </div>
            </div>
        </section>
    );
}

export default Statistics;