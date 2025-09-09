"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { getFlightOptions } from "@/app/exerciseUtils";

interface FlightOption {
  id: string;
  airline: string;
  price: number;
  duration: string;
}

function FlightBooking() {
  const [form, setForm] = useState({
    destination: "",
    departure: "",
    arrival: "",
    passengers: 1,
    isRoundtrip: false,
  });

  const [flights, setFlights] = useState<
    | {
        status: "idle" | "submitting" | "error";
        options: null;
      }
    | {
        status: "success";
        options: FlightOption[];
      }
  >({
    status: "idle",
    options: null,
  });
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  const selectedFlight =
    flights.options?.find((flight) => flight.id === selectedFlightId) || null;

  const totalPrice = selectedFlight
    ? selectedFlight.price * form.passengers
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFlights({ status: "submitting", options: null });
    setSelectedFlightId(null);

    try {
      const flights = await getFlightOptions(form);

      setFlights({ status: "success", options: flights });
    } catch {
      setFlights({ status: "error", options: null });
    }
  };

  const handleFlightSelect = (flight: FlightOption) => {
    setSelectedFlightId(flight.id);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Flight Booking</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="roundtrip"
            checked={form.isRoundtrip}
            onCheckedChange={(value) =>
              setForm((prevForm) => ({ ...prevForm, isRoundtrip: value }))
            }
          />
          <Label htmlFor="roundtrip">Roundtrip flight</Label>
        </div>

        <div>
          <Label htmlFor="destination" className="block mb-1">
            Destination
          </Label>
          <Input
            type="text"
            id="destination"
            value={form.destination}
            onChange={(e) =>
              setForm((prevForm) => ({
                ...prevForm,
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
            value={form.departure}
            onChange={(e) =>
              setForm((prevForm) => ({
                ...prevForm,
                departure: e.target.value,
              }))
            }
            required
          />
        </div>

        {form.isRoundtrip && (
          <div>
            <Label htmlFor="arrival" className="block mb-1">
              Return Date
            </Label>
            <Input
              type="date"
              id="arrival"
              value={form.arrival}
              onChange={(e) =>
                setForm((prevForm) => ({
                  ...prevForm,
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
            value={form.passengers}
            onChange={(e) =>
              setForm((prevForm) => ({
                ...prevForm,
                passengers: parseInt(e.target.value),
              }))
            }
            min="1"
            max="9"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={flights.status === "submitting"}
          className="w-full"
        >
          {flights.status === "submitting" ? "Searching..." : "Search Flights"}
        </Button>
      </form>

      {flights.status === "error" && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          An error occurred while searching for flights. Please try again.
        </div>
      )}

      {flights.status === "success" && flights.options.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Available Flights</h2>
          <div className="space-y-4">
            {flights.options.map((flight) => (
              <div
                key={flight.id}
                className={`p-4 border rounded hover:shadow-md ${
                  selectedFlightId === flight.id
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
                      onClick={() => handleFlightSelect(flight)}
                    >
                      {selectedFlightId === flight.id ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFlight && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
          <div className="space-y-2">
            <p>Flight: {selectedFlight.airline}</p>
            <p>Duration: {selectedFlight.duration}</p>
            <p>Passengers: {form.passengers}</p>
            <p className="text-xl font-bold mt-4">Total: ${totalPrice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return <FlightBooking />;
}
