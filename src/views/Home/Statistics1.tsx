import { Award, BookOpen, Globe, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import "./Statistics.css";
import { NavLink } from "react-router-dom";
import { apiClient } from "@/utils/http/clients/backendApiClientGeneral";


const Statistics: React.FC = () => {
    const statistics = [
        { icon: BookOpen, label: "totalPosts", value: "12,456", color: "text-blue-400", bgColor: "#51A2FF" },
        { icon: Users, label: "totalUsers", value: "3,892", color: "text-green-400", bgColor: "#34D399" },
        { icon: Globe, label: "totalGeoTaggedPosts", value: "1,234", color: "text-purple-400", bgColor: "#A78BFA" },
        { icon: Award, label: "totalTranslations", value: "8,765", color: "text-yellow-400", bgColor: "#FBBF24" }
    ];

    const [Statistics, setStatistics] = useState(statistics);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await apiClient.get(`/post/public/getDashboardCounts`);

                const data = response.data;

                if (data && data.data) {
                    const updatedStatistics = statistics.map(stat => {
                        if (stat.label === "totalPosts") {
                            return { ...stat, value: data.data.totalPosts.toString() };
                        } else if (stat.label === "totalUsers") {
                            return { ...stat, value: data.data.totalUsers.toString() };
                        } else if (stat.label === "totalGeoTaggedPosts") {
                            return { ...stat, value: data.data.totalGeoTaggedPosts.toString() };
                        } else if (stat.label === "totalTranslations") {
                            return { ...stat, value: data.data.totalTranslations.toString() };
                        }
                        return stat;
                    });
                    setStatistics(updatedStatistics);

                }
            } catch (error) {
                console.error("Error fetching statistics:", error);
            }
        };
        fetchStatistics();
    }, []);

    return (
        <section className="py-16 bg-secondary-background/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 ag-courses_item">
                    {Statistics.map((stat, index) => {
                        const IconComponent = stat.icon;
                        if (stat.label === "totalPosts") {
                            return (
                                <NavLink to={`/feed`} key={index} className="cursor-pointer">
                                    <div className="ag-courses-item_link text-center p-6 bg-primary-background/50 rounded-xl backdrop-blur-sm border border-slate-700/50 secondary-text-dark cursor-pointer">
                                        <div className="ag-courses-item_bg" style={{ backgroundColor: `${stat.bgColor}` }}>

                                        </div>
                                        <IconComponent className={`w-8 h-8 mx-auto mb-3 text-white ag-courses-item_icon-box`} />
                                        {/* <IconComponent className={`w-8 h-8 mx-auto mb-3 ${stat.color} `} /> */}
                                        <div className="text-3xl font-bold mb-1 ag-courses-item_title">{stat.value}</div>
                                        <div className="secondary-text-dark ag-courses-item_date-box">{stat.label}</div>
                                    </div>
                                </NavLink>
                            )
                        }
                        return (
                            <div key={index} className="ag-courses-item_link text-center p-6 bg-primary-background/50 rounded-xl backdrop-blur-sm border border-slate-700/50 secondary-text-dark cursor-pointer">
                                <div className="ag-courses-item_bg" style={{ backgroundColor: `${stat.bgColor}` }}>

                                </div>
                                <IconComponent className={`w-8 h-8 mx-auto mb-3 text-white ag-courses-item_icon-box`} />
                                {/* <IconComponent className={`w-8 h-8 mx-auto mb-3 ${stat.color} `} /> */}
                                <div className="text-3xl font-bold mb-1 ag-courses-item_title">{stat.value}</div>
                                <div className="secondary-text-dark ag-courses-item_date-box">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default Statistics;