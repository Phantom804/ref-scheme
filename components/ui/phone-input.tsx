"use client"

import { useState } from "react"
import { Check, ChevronDown, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import ReactCountryFlag from "react-country-flag"
import { getData } from "country-list"

// Get all countries from country-list package
const allCountries = getData().map((country) => ({
  code: country.code,
  name: country.name,
}))

interface PhoneInputProps {
  value?: string
  country?: string
  onPhoneChange?: (phone: string, country: string) => void
  placeholder?: string
  className?: string
}

export default function PhoneInput({
  value = "",
  country = "US",
  onPhoneChange,
  placeholder = "Enter phone number",
  className,
}: PhoneInputProps) {
  const [phoneNumber, setPhoneNumber] = useState(value)
  const [selectedCountry, setSelectedCountry] = useState(
    allCountries.find((c) => c.code === country) || allCountries[0],
  )
  const [open, setOpen] = useState(false)

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone)
    onPhoneChange?.(phone, selectedCountry.name)
  }

  const handleCountrySelect = (country: (typeof allCountries)[0]) => {
    setSelectedCountry(country)
    setOpen(false)
    onPhoneChange?.(phoneNumber, country.name)
  }

  return (
    <div className={cn("space-y-2", className)}>

      <div className="flex gap-2">
        {/* Country Selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-18 justify-between hover:bg-[#372759] bg-[#372759] border-[#47396d] px-3 py-2 h-10"
            >
              <div className="flex items-center gap-2">
                <ReactCountryFlag
                  countryCode={selectedCountry.code}
                  svg
                  style={{
                    width: "20px",
                    height: "15px",
                  }}
                />

              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" align="start">
            <Command className="bg-[#372759] text-gray-400">
              <CommandInput placeholder="Search countries..." className="h-9" />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandGroup>
                  {allCountries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.code}`}
                      onSelect={() => handleCountrySelect(country)}
                      className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-[#47396d]"
                    >
                      <ReactCountryFlag
                        countryCode={country.code}
                        svg
                        style={{
                          width: "20px",
                          height: "15px",
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{country.name}</div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedCountry.code === country.code ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Phone Number Input */}
        <div className="relative flex-1">

          <Input
            id="phone-input"
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder={placeholder}
            className="pl-3 bg-[#372759] border-[#47396d] text-white focus:border-purple-400 placeholder:text-gray-400"
            maxLength={15}
          />
        </div>
      </div>


    </div>
  )
}
