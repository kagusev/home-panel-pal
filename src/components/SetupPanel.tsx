
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { savePanelSettings, initializeBreakers } from '@/services/localStorageService';
import { toast } from "@/components/ui/use-toast";

interface SetupPanelProps {
  onComplete: () => void;
}

const SetupPanel = ({ onComplete }: SetupPanelProps) => {
  const [serviceRating, setServiceRating] = useState<number>(200);
  const [breakerCount, setBreakerCount] = useState<number>(20);
  const [spaces, setSpaces] = useState<number>(24);

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
    
    if (breakerCount > spaces) {
      toast({
        variant: "destructive",
        title: "Too many breakers",
        description: "The number of breakers cannot exceed the number of spaces."
      });
      return;
    }

    // Save panel settings
    savePanelSettings({ serviceRating, breakerCount, spaces });
    
    // Initialize breakers
    initializeBreakers(breakerCount);
    
    // Notify the parent component that setup is complete
    toast({
      title: "Setup Complete",
      description: "Your electrical panel has been configured."
    });
    
    onComplete();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Electrical Panel Setup</CardTitle>
          <CardDescription>Configure your home's electrical panel details</CardDescription>
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
          <CardFooter>
            <Button type="submit" className="w-full">Save & Continue</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SetupPanel;
