import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useParticipant } from '@/hooks/useParticipant';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  Database,
  MapPin,
  Calendar,
  Tag,
  MessageSquare,
  Lightbulb,
  TrendingDown,
  Users,
  Building,
  Clock,
  ArrowLeft,
  Sparkles,
  CheckSquare,
  ShoppingCart,
  ClipboardList,
  Star,
  Award,
  Heart,
  Gift
} from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function Insights() {
  const { isAuthenticated, isLoading: authLoading } = useParticipant();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState('property-feed');
  const [activeTab, setActiveTab] = useState('suburbs');
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

  // Property Feed Features
  const propertyFeedFeatures = [
    {
      icon: <MapPin className="h-5 w-5 text-blue-600" />,
      title: "Geographic Intelligence",
      description: "Location-based analytics across 1000+ suburbs",
      examples: ["State-by-state market analysis", "Suburb performance rankings", "Postcode trend mapping"]
    },
    {
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      title: "Financial Analytics",
      description: "Comprehensive pricing and transaction data",
      examples: ["Price trend analysis", "Sale type performance", "Premium calculations"]
    },
    {
      icon: <Building className="h-5 w-5 text-orange-600" />,
      title: "Property Intelligence",
      description: "Detailed property characteristics and features",
      examples: ["Property type analysis", "Bedroom/bathroom trends", "Construction preferences"]
    },
    {
      icon: <Calendar className="h-5 w-5 text-purple-600" />,
      title: "Market Timing",
      description: "Time-series data and seasonal patterns",
      examples: ["Monthly price trends", "Seasonal analysis", "Market timing insights"]
    }
  ];

  // Other App Ideas
  const otherIdeas = [
    {
      icon: <ShoppingCart className="h-5 w-5 text-blue-600" />,
      title: "Household Organizer",
      description: "Smart family management system",
      features: [
        "Collaborative shopping lists with real-time sync",
        "Smart grocery suggestions based on usage patterns",
        "Recipe integration with automatic ingredient lists",
        "Pantry tracking with expiry date alerts",
        "Budget tracking and spending insights"
      ],
      use_cases: [
        "Families managing weekly shopping",
        "Roommates coordinating household expenses",
        "Meal planning enthusiasts",
        "Budget-conscious households"
      ]
    },
    {
      icon: <ClipboardList className="h-5 w-5 text-green-600" />,
      title: "Task & To-Do Manager",
      description: "Intelligent task management for busy lives",
      features: [
        "Smart task prioritization with deadline awareness",
        "Recurring task automation",
        "Family member task assignment",
        "Progress tracking with visual timelines",
        "Integration with calendar apps"
      ],
      use_cases: [
        "Busy professionals managing work-life balance",
        "Parents coordinating family activities",
        "Students tracking assignments",
        "Freelancers managing multiple projects"
      ]
    },
    {
      icon: <Award className="h-5 w-5 text-yellow-600" />,
      title: "Kids Reward Charts",
      description: "Gamified behavior tracking for children",
      features: [
        "Customizable reward systems and point values",
        "Visual progress tracking with fun animations",
        "Multiple children profiles with individual goals",
        "Digital and physical reward options",
        "Parent dashboard with behavior insights"
      ],
      use_cases: [
        "Parents encouraging positive behavior",
        "Teachers tracking classroom participation",
        "Childcare centers managing activities",
        "Families establishing routines"
      ]
    },
    {
      icon: <Heart className="h-5 w-5 text-red-600" />,
      title: "Wellness Tracker",
      description: "Holistic health and wellbeing companion",
      features: [
        "Mood tracking with pattern analysis",
        "Exercise logging with goal setting",
        "Water intake and nutrition monitoring",
        "Sleep quality assessment",
        "Mindfulness reminders and guided sessions"
      ],
      use_cases: [
        "Individuals focusing on mental health",
        "Fitness enthusiasts tracking progress",
        "People with health conditions",
        "Wellness coaches and their clients"
      ]
    },
    {
      icon: <Gift className="h-5 w-5 text-purple-600" />,
      title: "Gift & Event Planner",
      description: "Never forget another special occasion",
      features: [
        "Smart gift suggestions based on interests",
        "Budget planning with price tracking",
        "Event countdown and reminder system",
        "Guest list management with RSVP tracking",
        "Shared planning with family members"
      ],
      use_cases: [
        "Families with multiple birthdays to track",
        "Event planners organizing celebrations",
        "Friends coordinating group gifts",
        "Busy professionals managing social obligations"
      ]
    }
  ];

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
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            navigate('/onboarding/step/2');
          }}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Ideas & Inspiration
          </h1>
          <p className="mt-4 text-muted-foreground">
            Get inspired with proven app concepts and real data to power your prototype. Choose your path!
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="property-feed">Prototype Property Feed</TabsTrigger>
            <TabsTrigger value="other-ideas">Other App Ideas</TabsTrigger>
          </TabsList>

          <TabsContent value="property-feed" className="space-y-6">
            {/* Property Feed Header Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Property Data Feed</CardTitle>
                    <CardDescription>
                      Rich real estate dataset with 428,576+ property sales records
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Quick stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">428K+</div>
                      <div className="text-sm text-muted-foreground">Sales Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">1000+</div>
                      <div className="text-sm text-muted-foreground">Suburbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">8</div>
                      <div className="text-sm text-muted-foreground">States/Territories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">4+</div>
                      <div className="text-sm text-muted-foreground">Years of Data</div>
                    </div>
                  </div>

                  {/* Feature cards with accordions */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {propertyFeedFeatures.map((feature, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-600">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {feature.icon}
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{feature.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                              <div className="space-y-1 mb-2">
                                {feature.examples.map((example, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                                    {example}
                                  </Badge>
                                ))}
                              </div>
                              <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="details" className="border-0">
                                  <AccordionTrigger className="text-xs py-2 hover:no-underline">
                                    View detailed attributes
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-2 text-xs">
                                      {index === 0 && (
                                        <>
                                          <div className="flex justify-between">
                                            <span className="font-medium">State</span>
                                            <Badge variant="secondary" className="text-xs">NSW, VIC, QLD, WA, SA, TAS, ACT, NT</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Suburb</span>
                                            <Badge variant="secondary" className="text-xs">1000+ suburbs</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Postcode</span>
                                            <Badge variant="secondary" className="text-xs">Numeric codes</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Combined Key</span>
                                            <Badge variant="secondary" className="text-xs">State-Suburb-Postcode</Badge>
                                          </div>
                                        </>
                                      )}
                                      {index === 1 && (
                                        <>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Listed Price</span>
                                            <Badge variant="secondary" className="text-xs">price_search</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Sold Price</span>
                                            <Badge variant="secondary" className="text-xs">price_search_sold</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Price Premium</span>
                                            <Badge variant="secondary" className="text-xs">Calculated difference</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Financial Year</span>
                                            <Badge variant="secondary" className="text-xs">2021-2024</Badge>
                                          </div>
                                        </>
                                      )}
                                      {index === 2 && (
                                        <>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Property Type</span>
                                            <Badge variant="secondary" className="text-xs">House, Unit, Townhouse</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Bedrooms</span>
                                            <Badge variant="secondary" className="text-xs">1-6+ rooms</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Bathrooms</span>
                                            <Badge variant="secondary" className="text-xs">1-5+ rooms</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Construction</span>
                                            <Badge variant="secondary" className="text-xs">New vs Existing</Badge>
                                          </div>
                                        </>
                                      )}
                                      {index === 3 && (
                                        <>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Sale Type</span>
                                            <Badge variant="secondary" className="text-xs">Private, Auction</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Active Month</span>
                                            <Badge variant="secondary" className="text-xs">Sale completion date</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Channel</span>
                                            <Badge variant="secondary" className="text-xs">Buy channel</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Agency ID</span>
                                            <Badge variant="secondary" className="text-xs">Hashed identifier</Badge>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Panel B: Insight Stories */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <CardTitle>Insight Stories & Analysis Opportunities</CardTitle>
                </div>
                <CardDescription>
                  Real-world analysis scenarios using the property data
                </CardDescription>
              </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {/* Market Trends Story */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Market Performance Analysis</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            <strong>Story:</strong> "Are auctions really more profitable than private sales? Our data reveals that 
                            auction properties in Sydney achieved an average 8.5% premium over asking price in 2023, while 
                            private sales averaged only 2.1% premium. However, the story changes in regional markets..."
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline">Sale Type Analysis</Badge>
                            <Badge variant="outline">Price Premium Calculation</Badge>
                            <Badge variant="outline">Geographic Segmentation</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seasonal Trends Story */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Seasonal Market Dynamics</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            <strong>Story:</strong> "Spring selling season myth or reality? Analysis of 400K+ sales shows October-November 
                            consistently delivers 15% higher sale volumes, but interestingly, the highest price premiums occur 
                            in winter months when supply is constrained..."
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline">Time Series Analysis</Badge>
                            <Badge variant="outline">Supply/Demand Patterns</Badge>
                            <Badge variant="outline">Price Seasonality</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Agency Performance Story */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-purple-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Agency Performance Benchmarking</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            <strong>Story:</strong> "Which agencies consistently achieve above-market results? By analyzing agency performance 
                            across different property types and price segments, we identify that boutique agencies excel in luxury markets 
                            while franchises dominate volume sales in suburban areas..."
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline">Agency Comparison</Badge>
                            <Badge variant="outline">Market Segmentation</Badge>
                            <Badge variant="outline">Performance Metrics</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Construction Impact Story */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Home className="h-5 w-5 text-orange-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">New vs Established Property Value</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            <strong>Story:</strong> "New construction premium varies dramatically by location. In growth corridors, new homes 
                            command 25% premium, but in established inner-city suburbs, buyers prefer character homes, with new builds 
                            selling at a 10% discount. Location context is everything..."
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline">Construction Analysis</Badge>
                            <Badge variant="outline">Location Premium</Badge>
                            <Badge variant="outline">Buyer Preferences</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* Panel C: Data Visualisation ideas */}
            <Card>
              <CardHeader>
                <CardTitle>Data Visualisation ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="suburbs">Suburbs</TabsTrigger>
                    <TabsTrigger value="types">Property Types</TabsTrigger>
                    <TabsTrigger value="trends">Price Trends</TabsTrigger>
                    <TabsTrigger value="search">Search</TabsTrigger>
                  </TabsList>

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
                <CardDescription>Median sale prices by month over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : priceTrends.length === 0 ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No price trend data available</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {priceTrends.length} months of data • Median Price: {priceTrends.length > 0 ? (() => {
                          const sortedPrices = [...priceTrends].map(t => t.median_price).sort((a, b) => a - b);
                          const mid = Math.floor(sortedPrices.length / 2);
                          const median = sortedPrices.length % 2 === 0 
                            ? (sortedPrices[mid - 1] + sortedPrices[mid]) / 2 
                            : sortedPrices[mid];
                          return formatPrice(median);
                        })() : '$0'}
                      </p>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={[...priceTrends].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tickFormatter={(value) => formatPrice(value)} 
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'median_price' ? formatPrice(value as number) : formatNumber(value as number),
                            name === 'median_price' ? 'Median Price' : 'Total Sales'
                          ]}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="median_price" 
                          stroke="#8884d8" 
                          strokeWidth={3}
                          dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other-ideas" className="space-y-6">
            {/* Other Ideas Tab */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                  Popular App Categories
                </CardTitle>
                <CardDescription>
                  Proven app concepts that solve real problems for everyday users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {otherIdeas.map((idea, index) => (
                    <Card key={index} className="border-l-4 border-l-green-600">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-gray-50">
                            {idea.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{idea.title}</h3>
                            <p className="text-muted-foreground mb-4">{idea.description}</p>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2 text-green-700">Key Features</h4>
                                <ul className="space-y-1">
                                  {idea.features.map((feature, idx) => (
                                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <CheckSquare className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2 text-blue-700">Perfect For</h4>
                                <ul className="space-y-1">
                                  {idea.use_cases.map((use_case, idx) => (
                                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <Users className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                                      {use_case}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA for other ideas */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Ready to Build?</h3>
                <p className="text-muted-foreground mb-4">
                  These are just starting points! Mix, match, or create something entirely new.
                </p>
                <Button
                  onClick={() => navigate('/onboarding/step/2')}
                  size="lg"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Start Building My App
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back button at bottom */}
        <div className="mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
              navigate('/onboarding/step/2');
            }}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
