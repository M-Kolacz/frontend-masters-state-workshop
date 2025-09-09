"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createContext,
  ReactNode,
  use,
  useContext,
  useReducer,
  useState,
} from "react";
import { FlightOption, getFlightOptions } from "@/app/exerciseUtils";

function SearchResults() {
  const { handleReset: onBack, state } = useFlightContext();
  const flightOptions = state.flightOptions || [];
  const passengers = state.searchParams?.passengers || 1;

  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const selectedFlight =
    flightOptions.find((flight) => flight.id === selectedFlightId) || null;

  const totalPrice = selectedFlight ? selectedFlight.price * passengers : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Search Results</h2>
        <Button variant="outline" onClick={onBack}>
          Back to Search
        </Button>
      </div>

      <div className="space-y-4">
        {flightOptions.map((flight) => (
          <div
            key={flight.id}
            className={`p-4 border rounded hover:shadow-md ${
              selectedFlight?.id === flight.id
                ? "border-blue-500 bg-blue-50"
                : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{flight.airline}</h3>
                <p className="text-gray-600">Duration: {flight.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">${flight.price}</p>
                <Button
                  className="mt-2 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                  onClick={() => setSelectedFlightId(flight.id)}
                >
                  {selectedFlight?.id === flight.id ? "Selected" : "Select"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFlight && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
          <div className="space-y-2">
            <p>Flight: {selectedFlight.airline}</p>
            <p>Duration: {selectedFlight.duration}</p>
            <p>Passengers: {passengers}</p>
            <p className="text-xl font-bold mt-4">Total: ${totalPrice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingForm() {
  const { handleSubmit: onSubmit, state } = useFlightContext();

  const isSubmitting = state.status === "loading";

  const [formData, setFormData] = useState<{
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  }>(
    state.searchParams || {
      destination: "",
      departure: "",
      arrival: "",
      passengers: 1,
      isOneWay: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="one-way"
          checked={formData.isOneWay}
          onCheckedChange={(isOneWay) =>
            setFormData((prevState) => ({ ...prevState, isOneWay }))
          }
        />
        <Label htmlFor="one-way">One-way flight</Label>
      </div>

      <div>
        <Label htmlFor="destination" className="block mb-1">
          Destination
        </Label>
        <Input
          type="text"
          id="destination"
          value={formData.destination}
          onChange={(e) =>
            setFormData((prevState) => ({
              ...prevState,
              destination: e.target.value,
            }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="departure" className="block mb-1">
          Departure Date
        </Label>
        <Input
          type="date"
          id="departure"
          value={formData.departure}
          onChange={(e) =>
            setFormData((prevState) => ({
              ...prevState,
              departure: e.target.value,
            }))
          }
          required
        />
      </div>

      {!formData.isOneWay && (
        <div>
          <Label htmlFor="arrival" className="block mb-1">
            Return Date
          </Label>
          <Input
            type="date"
            id="arrival"
            value={formData.arrival}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                arrival: e.target.value,
              }))
            }
            required
          />
        </div>
      )}

      <div>
        <Label htmlFor="passengers" className="block mb-1">
          Number of Passengers
        </Label>
        <Input
          type="number"
          id="passengers"
          value={formData.passengers}
          onChange={(e) =>
            setFormData((prevState) => ({
              ...prevState,
              passengers: parseInt(e.target.value),
            }))
          }
          min="1"
          max="9"
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Searching..." : "Search Flights"}
      </Button>
    </form>
  );
}

type FlightState = {
  status: "loading" | "success" | "error" | "idle";
  flightOptions: FlightOption[] | null;
  searchParams: {
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  } | null;
};

type FlightAction =
  | {
      type: "LOADING";
      searchParams: {
        destination: string;
        departure: string;
        arrival: string;
        passengers: number;
        isOneWay: boolean;
      };
    }
  | {
      type: "SUCCESS";
      flightOptions: FlightOption[];
    }
  | {
      type: "ERROR";
    }
  | {
      type: "RESET";
    };

const flightReducer = (
  state: FlightState,
  action: FlightAction
): FlightState => {
  switch (action.type) {
    case "LOADING":
      return {
        ...state,
        status: "loading",
        searchParams: action.searchParams,
      };
    case "SUCCESS":
      return {
        ...state,
        status: "success",
        flightOptions: action.flightOptions,
      };
    case "ERROR":
      return {
        ...state,
        status: "error",
      };
    case "RESET":
      return {
        ...state,
        status: "idle",
      };
  }
};

const initialFlightState: FlightState = {
  status: "idle",
  flightOptions: null,
  searchParams: null,
};

const FlightContext = createContext<{
  state: FlightState;
  handleSubmit: (formData: {
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  }) => Promise<void>;
  handleReset: () => void;
} | null>(null);

const useFlightContext = () => {
  const context = useContext(FlightContext);
  if (!context) {
    throw new Error("useFlightContext must be used within a FlightProvider");
  }
  return context;
};

const FlightProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(flightReducer, initialFlightState);

  const handleSubmit = async (formData: {
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  }) => {
    dispatch({ type: "LOADING", searchParams: formData });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockFlights = await getFlightOptions(formData);
      dispatch({ type: "SUCCESS", flightOptions: mockFlights });
    } catch {
      dispatch({ type: "ERROR" });
    }
  };

  const handleReset = () => dispatch({ type: "RESET" });

  return (
    <FlightContext.Provider value={{ state, handleSubmit, handleReset }}>
      {children}
    </FlightContext.Provider>
  );
};

const FlightContent = () => {
  const { state } = useFlightContext();

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Flight Booking</h1>
      {state.status !== "success" ? (
        <>
          <BookingForm />
          {state.status === "error" && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              An error occurred while searching for flights. Please try again.
            </div>
          )}
        </>
      ) : (
        <SearchResults />
      )}
    </div>
  );
};

export default function Page() {
  return (
    <FlightProvider>
      <FlightContent />
    </FlightProvider>
  );
}
