import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

export function AccountSelect({ 
  accounts = [], 
  selectedAccounts = [], 
  onChange,
  onSelectAllChange,
  className 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Determine if all accounts are selected
  const allSelected = selectedAccounts.length === accounts.length && accounts.length > 0;

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter(account =>
    account.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectAll = () => {
    // If all are currently selected, deselect all
    if (allSelected) {
      onChange([]); // Deselect all
      onSelectAllChange?.(false); // Notify parent that Select All is off
    } else {
      // Select all accounts
      const allAccountIds = accounts.map(acc => acc.Id);
      onChange(allAccountIds);
      onSelectAllChange?.(true); // Notify parent that Select All is on
    }
  };

  const handleToggleAccount = (accountId) => {
    const newSelected = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter(id => id !== accountId)
      : [...selectedAccounts, accountId];
    onChange(newSelected);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const getDisplayText = () => {
    if (selectedAccounts.length === 0) {
      return "Select Accounts";
    }
    if (selectedAccounts.length === accounts.length) {
      return `All Accounts (${accounts.length})`;
    }
    return `${selectedAccounts.length} account${selectedAccounts.length > 1 ? 's' : ''} selected`;
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2 w-full bg-background border-[1px] border-gray-300 h-8 md:h-10 text-xs md:text-sm rounded-md px-2",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
      >
        <span className={cn(
          selectedAccounts.length === 0 && "text-muted-foreground"
        )}>
          {getDisplayText()}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs md:text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Select All Option */}
          <div className="border-b border-border p-2">
            <label
              className="flex items-center gap-2 cursor-pointer hover:bg-accent p-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAll();
              }}
            >
              <div className={cn(
                "w-4 h-4 border rounded flex items-center justify-center",
                allSelected
                  ? "bg-primary border-primary" 
                  : "border-muted-foreground"
              )}>
                {allSelected && (
                  <Check className="h-3 w-3 text-white font-bold" />
                )}
              </div>
              <span className="text-xs md:text-sm font-medium">Select All</span>
            </label>
          </div>

          {/* Account List */}
          <div className="flex-1 overflow-auto p-1">
            {filteredAccounts.length === 0 ? (
              <div className="p-2 text-xs md:text-sm text-muted-foreground text-center">
                {searchTerm ? "No matching accounts" : "No accounts available"}
              </div>
            ) : (
              filteredAccounts.map((account) => (
                <label
                  key={account.Id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleAccount(account.Id);
                  }}
                >
                  <div className={cn(
                    "w-4 h-4 border rounded flex items-center justify-center",
                    selectedAccounts.includes(account.Id)
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  )}>
                    {selectedAccounts.includes(account.Id) && (
                      <Check className="h-3 w-3 text-white font-bold" />
                    )}
                  </div>
              <span className="text-xs md:text-sm truncate">
                    {account.Name}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

