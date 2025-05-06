
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBreakers, updateBreaker, Breaker } from '@/services/localStorageService';
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from 'lucide-react';

// Update the Breaker interface in this file
interface ExtendedBreaker extends Breaker {
  interruptionType?: string;
  breakerType?: string;
}

const BreakerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [breaker, setBreaker] = useState<ExtendedBreaker | null>(null);
  const [name, setName] = useState('');
  const [amperage, setAmperage] = useState(0);
  const [isOn, setIsOn] = useState(true);
  const [interruptionType, setInterruptionType] = useState('Standard Trip');
  const [breakerType, setBreakerType] = useState('Single Pole');
  
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    
    const breakerId = parseInt(id);
    const breakers = getBreakers();
    const foundBreaker = breakers.find(b => b.id === breakerId);
    
    if (!foundBreaker) {
      toast({
        variant: "destructive",
        title: "Breaker not found",
        description: "The specified breaker doesn't exist."
      });
      navigate('/');
      return;
    }
    
    setBreaker(foundBreaker);
    setName(foundBreaker.name);
    setAmperage(foundBreaker.amperage);
    setIsOn(foundBreaker.isOn);
    setInterruptionType(foundBreaker.interruptionType || 'Standard Trip');
    setBreakerType(foundBreaker.breakerType || 'Single Pole');
  }, [id, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!breaker) return;
    
    const updatedBreaker: ExtendedBreaker = {
      ...breaker,
      name,
      amperage,
      isOn,
      interruptionType,
      breakerType
    };
    
    updateBreaker(updatedBreaker);
    
    toast({
      title: "Breaker Updated",
      description: "Your changes have been saved."
    });
    
    navigate('/');
  };
  
  const handleCancel = () => {
    navigate('/');
  };
  
  if (!breaker) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center" 
        onClick={handleCancel}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Panel
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Breaker {breaker.position} </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="breaker-name">Name</Label>
              <Input
                id="breaker-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Kitchen Lights"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="breaker-type">Breaker Type</Label>
              <Select 
                value={breakerType} 
                onValueChange={(value) => setBreakerType(value)}
              >
                <SelectTrigger id="breaker-type" className="w-full">
                  <SelectValue placeholder="Select breaker type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single Pole">Single Pole</SelectItem>
                  <SelectItem value="Double Pole">Double Pole</SelectItem>
                  <SelectItem value="Triple Pole">Triple Pole</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="breaker-amperage">Amperage</Label>
              <Select 
                value={amperage ? amperage.toString() : "0"} 
                onValueChange={(value) => setAmperage(parseInt(value))}
              >
                <SelectTrigger id="breaker-amperage" className="w-full">
                  <SelectValue placeholder="Select amperage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15A</SelectItem>
                  <SelectItem value="20">20A</SelectItem>
                  <SelectItem value="30">30A</SelectItem>
                  <SelectItem value="40">40A</SelectItem>
                  <SelectItem value="50">50A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="breaker-interruption-type">Interruption Type</Label>
              <Select 
                value={interruptionType} 
                onValueChange={(value) => setInterruptionType(value)}
              >
                <SelectTrigger id="breaker-interruption-type" className="w-full">
                  <SelectValue placeholder="Select interruption type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard Trip">Standard Trip</SelectItem>
                  <SelectItem value="GFCI">GFCI</SelectItem>
                  <SelectItem value="AFCI">AFCI</SelectItem>
                  <SelectItem value="AFCI/GFCI">AFCI/GFCI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="breaker-state"
                checked={isOn}
                onChange={(e) => setIsOn(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="breaker-state">Breaker is {isOn ? 'On' : 'Off'}</Label>
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
  );
};

export default BreakerDetail;
