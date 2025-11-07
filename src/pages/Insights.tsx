import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useParticipant } from '@/hooks/useParticipant';
import { 
  getSuburbInsights, 
  getPropertyTypeInsights, 
  getPriceTrends, 
  getSaleTypeInsights, 
  getMarketStats,
  searchProperties,
  type PriceInsight,
  type PropertyTypeInsight,
  type TimeSeriesInsight,
  type SaleTypeInsight,
  type PropertySalesData
} from '@/services/database';
import { 
  TrendingUp, 
  Home, 
  DollarSign, 
  BarChart3, 
  PieChart as PieChartIcon,
  Search,
  Loader2,
  AlertCircle 
} from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function Insights() {
  const { isAuthenticated, isLoading: authLoading } = useParticipant();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [marketStats, setMarketStats] = useState<any>(null);
  const [suburbInsights, setSuburbInsights] = useState<PriceInsight[]>([]);
  const [propertyTypeInsights, setPropertyTypeInsights] = useState<PropertyTypeInsight[]>([]);
  const [priceTrends, setPriceTrends] = useState<TimeSeriesInsight[]>([]);
  const [saleTypeInsights, setSaleTypeInsights] = useState<SaleTypeInsight[]>([]);
  const [searchResults, setSearchResults] = useState<PropertySalesData[]>([]);

  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    suburb: '',
    property_type: 'all',
    min_price: '',
    max_price: '',
    bedrooms: '',
    bathrooms: '',
    sale_type: 'all',
    year: ''
  });

  const loadData = async (state?: string) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const stateFilter = state === 'all' ? undefined : state;
      const [
        stats,
        suburbs,
        propertyTypes,
        trends,
        saleTypes
      ] = await Promise.all([
        getMarketStats(stateFilter),
        getSuburbInsights(stateFilter, 20),
        getPropertyTypeInsights(stateFilter),
        getPriceTrends(stateFilter, undefined, 12),
        getSaleTypeInsights(stateFilter)
      ]);

      setMarketStats(stats);
      setSuburbInsights(suburbs);
      setPropertyTypeInsights(propertyTypes);
      setPriceTrends(trends);
      setSaleTypeInsights(saleTypes);
    } catch (err) {
      setError('Failed to load insights data. Please try again.');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const filters = {
        suburb: searchFilters.suburb || undefined,
        property_type: searchFilters.property_type === 'all' ? undefined : searchFilters.property_type,
        sale_type: searchFilters.sale_type === 'all' ? undefined : searchFilters.sale_type,
        state: selectedState === 'all' ? undefined : selectedState,
        min_price: searchFilters.min_price ? parseInt(searchFilters.min_price) : undefined,
        max_price: searchFilters.max_price ? parseInt(searchFilters.max_price) : undefined,
        bedrooms: searchFilters.bedrooms ? parseInt(searchFilters.bedrooms) : undefined,
        bathrooms: searchFilters.bathrooms ? parseInt(searchFilters.bathrooms) : undefined,
        year: searchFilters.year ? parseInt(searchFilters.year) : undefined,
        limit: 50
      };

      const result = await searchProperties(filters);
      setSearchResults(result.data);
    } catch (err) {
      setError('Failed to search properties. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedState);
  }, [isAuthenticated, selectedState]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access property insights.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-AU').format(num);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Property Market Insights</h1>
            <p className="text-muted-foreground">
              Analyze real estate data with {marketStats ? formatNumber(marketStats.total_sales) : '400K+'} property sales
            </p>
          </div>
          
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="NSW">NSW</SelectItem>
              <SelectItem value="VIC">VIC</SelectItem>
              <SelectItem value="QLD">QLD</SelectItem>
              <SelectItem value="WA">WA</SelectItem>
              <SelectItem value="SA">SA</SelectItem>
              <SelectItem value="TAS">TAS</SelectItem>
              <SelectItem value="ACT">ACT</SelectItem>
              <SelectItem value="NT">NT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="suburbs">Suburbs</TabsTrigger>
            <TabsTrigger value="types">Property Types</TabsTrigger>
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <>
                {/* Market Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {marketStats ? formatNumber(marketStats.total_sales) : '0'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {marketStats ? formatPrice(marketStats.avg_price) : '$0'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Median Price</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {marketStats ? formatPrice(marketStats.median_price) : '$0'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Suburbs</CardTitle>
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {marketStats ? formatNumber(marketStats.total_suburbs) : '0'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Property Types Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Property Types Distribution</CardTitle>
                    <CardDescription>Market share by property type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={propertyTypeInsights}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({property_type, market_share_pct}) => `${property_type}: ${market_share_pct}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="market_share_pct"
                        >
                          {propertyTypeInsights.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Sale Types */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sale Type Performance</CardTitle>
                    <CardDescription>Average prices and premium rates by sale method</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {saleTypeInsights.map((saleType) => (
                        <div key={saleType.sale_type} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{saleType.sale_type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatNumber(saleType.total_sales)} sales
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(saleType.avg_price)}</p>
                            <Badge variant={saleType.avg_premium_pct > 0 ? "default" : "secondary"}>
                              {saleType.avg_premium_pct > 0 ? '+' : ''}{saleType.avg_premium_pct}% premium
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="suburbs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Suburbs</CardTitle>
                <CardDescription>Suburbs with highest sales activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={suburbInsights.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="suburb" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis tickFormatter={(value) => formatPrice(value)} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'avg_price' ? formatPrice(value as number) : formatNumber(value as number),
                        name === 'avg_price' ? 'Average Price' : 'Total Sales'
                      ]}
                    />
                    <Bar dataKey="avg_price" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Type Analysis</CardTitle>
                <CardDescription>Average prices by property type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={propertyTypeInsights}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="property_type" />
                    <YAxis tickFormatter={(value) => formatPrice(value)} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'avg_price' ? formatPrice(value as number) : formatNumber(value as number),
                        name === 'avg_price' ? 'Average Price' : 'Total Sales'
                      ]}
                    />
                    <Bar dataKey="avg_price" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Trends Over Time</CardTitle>
                <CardDescription>Average sale prices by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={priceTrends.reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatPrice(value)} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'avg_price' ? formatPrice(value as number) : formatNumber(value as number),
                        name === 'avg_price' ? 'Average Price' : 'Total Sales'
                      ]}
                    />
                    <Line type="monotone" dataKey="avg_price" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Search</CardTitle>
                <CardDescription>Search and filter property sales data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Suburb"
                    value={searchFilters.suburb}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, suburb: e.target.value }))}
                  />
                  <Select 
                    value={searchFilters.property_type} 
                    onValueChange={(value) => setSearchFilters(prev => ({ ...prev, property_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="unit">Unit</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={searchFilters.sale_type} 
                    onValueChange={(value) => setSearchFilters(prev => ({ ...prev, sale_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sale Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sale Types</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Auction">Auction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Min Price"
                    type="number"
                    value={searchFilters.min_price}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, min_price: e.target.value }))}
                  />
                  <Input
                    placeholder="Max Price"
                    type="number"
                    value={searchFilters.max_price}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, max_price: e.target.value }))}
                  />
                  <Input
                    placeholder="Bedrooms"
                    type="number"
                    value={searchFilters.bedrooms}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                  />
                  <Input
                    placeholder="Bathrooms"
                    type="number"
                    value={searchFilters.bathrooms}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, bathrooms: e.target.value }))}
                  />
                </div>

                <Button onClick={handleSearch} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Search Properties
                </Button>

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchResults.map((property) => (
                        <div key={property.listing_instance_id_hash} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">
                                {property.suburb}, {property.state} {property.postcode}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {property.property_type} • {property.bedrooms} bed • {property.bathrooms} bath
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Sold {new Date(property.active_month).toLocaleDateString()} • {property.sale_type}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatPrice(property.price_search_sold)}</p>
                              {property.price_search !== property.price_search_sold && (
                                <p className="text-sm text-muted-foreground">
                                  Listed: {formatPrice(property.price_search)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
