import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Database,
  TrendingUp,
  Home,
  DollarSign,
  BarChart3,
  MapPin,
  Calendar,
  Building,
  Users,
  CheckSquare,
  ShoppingCart,
  ClipboardList,
  Star,
  Award,
  Heart,
  Lightbulb,
  Sparkles,
  Gift
} from 'lucide-react';

export default function Inspiration() {
  const navigate = useNavigate();

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
          Back to PRD
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

        <Tabs defaultValue="property-feed" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="property-feed">Prototype Property Feed</TabsTrigger>
            <TabsTrigger value="other-ideas">Other App Ideas</TabsTrigger>
          </TabsList>

          <TabsContent value="property-feed" className="space-y-6">
            {/* Property Feed Tab */}
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

                  {/* Feature cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {propertyFeedFeatures.map((feature, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-600">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {feature.icon}
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{feature.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                              <div className="space-y-1">
                                {feature.examples.map((example, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                                    {example}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => navigate('/insights')}
                      className="flex-1"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Explore Property Data
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/onboarding/step/2')}
                      className="flex-1"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Use This Data in My PRD
                    </Button>
                  </div>
                </div>
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
            Back to PRD
          </Button>
        </div>
      </div>
    </div>
  );
}
