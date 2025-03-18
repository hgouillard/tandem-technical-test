"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Users, AlertTriangle, Activity, Percent } from "lucide-react";
import { fetchAnalytics } from "@/app/api/client/requests/analytics";
import { GroupedData } from "@/scripts/dataingest/types";
import Image from "next/image";

export default function AnalyticsPage() {
  const [data, setData] = useState<GroupedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const analyticsData = await fetchAnalytics();
        console.log(analyticsData);
        setData(analyticsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#43f191]"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Erreur lors du chargement des données</div>
      </div>
    );
  }

  console.log('render data : ', data);
  const totalSessions = Object.values(data.userSessions).reduce((acc, sessions) => acc + sessions.length, 0);
  const uniqueUsers = Object.keys(data.userSessions).length;
  const totalErrors = Object.values(data.errors).reduce((a, b) => a + b, 0);
  const errorRate = ((totalErrors / totalSessions) * 100).toFixed(1);

  const pageViewsData = Object.entries(data.pageViews).map(([path, count]) => ({
    name: path,
    value: count,
  }));

  const searchQueriesData = Object.entries(data.searchQueries).map(([query, count]) => ({
    name: query,
    value: count,
  }));

  const productInteractionsData = Object.entries(data.productInteractions).map(([product, count]) => ({
    name: product,
    value: count,
  }));

  return (
    <div className="min-h-screen bg-[#0D231F]">
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/app_logo_inverted.svg"
              alt="App Logo"
              width={179}
              height={64}
            />
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Sessions</CardTitle>
              <Activity className="h-4 w-4 text-[#43f191]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalSessions}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Utilisateurs uniques</CardTitle>
              <Users className="h-4 w-4 text-[#43f191]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{uniqueUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Erreurs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-[#43f191]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalErrors}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Taux d&apos;erreurs</CardTitle>
              <Percent className="h-4 w-4 text-[#43f191]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{errorRate}%</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 bg-white/5 backdrop-blur-sm border-white/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Statistiques des sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/70">Sessions moyennes par utilisateur</h3>
                <p className="text-2xl font-bold text-white">{Math.round(totalSessions / uniqueUsers)}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/70">Durée moyenne des sessions</h3>
                <p className="text-2xl font-bold text-white">~2-3 minutes</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/70">Période la plus active</h3>
                <p className="text-2xl font-bold text-white">09:00 - 11:30</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/70">Distribution des sessions</h3>
                <p className="text-2xl font-bold text-white">Multiples par utilisateur</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Vues des pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageViewsData}>
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0D231F', 
                        border: '1px solid #43f191',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="value" fill="#43f191" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Recherches populaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={searchQueriesData}>
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0D231F', 
                        border: '1px solid #43f191',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#43f191" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Interactions produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productInteractionsData}>
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0D231F', 
                        border: '1px solid #43f191',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="value" fill="#43f191" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Erreurs rencontrées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.errors)
                  .sort(([, a], [, b]) => b - a)
                  .map(([error, count]) => (
                    <div key={error} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-white/70">{error}</span>
                      <span className="font-semibold text-[#43f191]">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
