
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { savePanelSettings, getPanelSettings, getBreakers, initializeBreakers } from '@/services/localStorageService';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EditPanel = () => {
  const navigate = useNavigate();
  const [serviceRating, setServiceRating] = useState<number>(200);
  const [breakerCount, setBreakerCount] = useState<number>(20);
  const [spaces, setSpaces] = useState<number>(24);
  
  useEffect(() => {
    // Load existing panel settings
    const settings = getPanelSettings();
    if (settings) {
      setServiceRating(settings.serviceRating || 200);
      setBreakerCount(settings.breakerCount || 20);
      setSpaces(settings.spaces || 24);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (breakerCount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid breaker count",
        description: "Please enter a positive number of breakers."
      });
      return;
    }

    if (serviceRating <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid service rating",
        description: "Please enter a positive service rating."
      });
      return;
    }
    
    if (spaces % 2 !== 0) {
      toast({
        variant: "destructive",
        title: "Invalid number of spaces",
        description: "The number of spaces must be even."
      });
      return;
    }
    
    // Get current breakers to check if we need to adjust
    const existingBreakers = getBreakers();
    const currentBreakerCount = existingBreakers.length;
    
    if (breakerCount > spaces) {
      toast({
        variant: "destructive",
        title: "Too many breakers",
        description: "The number of breakers cannot exceed the number of spaces."
      });
      return;
    }
    
    if (currentBreakerCount > spaces) {
      toast({
        variant: "destructive",
        title: "Insufficient spaces",
        description: "The current number of breakers exceeds the selected spaces. Please remove some breakers first or increase the number of spaces."
      });
      return;
    }

    // Save panel settings
    savePanelSettings({ serviceRating, breakerCount, spaces });
    
    toast({
      title: "Panel Updated",
      description: `Your electrical panel now has ${spaces} spaces with ${breakerCount} breakers.`
    });
    
    navigate('/');
  };
  
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center text-white" 
          onClick={handleCancel}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Panel
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Edit Panel Settings</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-rating">Service Rating (Amps)</Label>
                <Input
                  id="service-rating"
                  type="number"
                  value={serviceRating}
                  onChange={(e) => setServiceRating(parseInt(e.target.value) || 0)}
                  min="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="panel-spaces">Number of Spaces</Label>
                <Select 
                  value={spaces.toString()} 
                  onValueChange={(value) => setSpaces(parseInt(value))}
                >
                  <SelectTrigger id="panel-spaces" className="w-full">
                    <SelectValue placeholder="Select number of spaces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="36">36</SelectItem>
                    <SelectItem value="42">42</SelectItem>
                    <SelectItem value="54">54</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">Panel spaces must be an even number</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="breaker-count">Number of Breakers</Label>
                <Input
                  id="breaker-count"
                  type="number"
                  value={breakerCount}
                  onChange={(e) => setBreakerCount(parseInt(e.target.value) || 0)}
                  min="1"
                  max={spaces}
                  required
                />
                <p className="text-xs text-gray-400">Cannot exceed the number of spaces ({spaces})</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditPanel;
