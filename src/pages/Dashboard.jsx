import { useState, useMemo, useEffect } from "react";
import { format, addMonths, subMonths, parseISO, isSameMonth } from "date-fns";
import {
  FileText,
  CheckCircle2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Percent,
} from "lucide-react";
// import { StatCard } from "@/components/dashboard/StatCard";
import { FundingProgramSelect } from "../components/dashboard/FundingProgramSelect";
import { DealPipelineChart } from "../components/dashboard/DealPipelineChart";
import { FundingVolumeChart } from "../components/dashboard/FundingVolumeChart";
import { FundingByProgramChart } from "../components/dashboard/FundingByProgramChart";
import { EarningsForecast } from "../components/dashboard/EarningsForecast";
import { ReferralsTable } from "../components/dashboard/ReferralsTable";
import { NextActions } from "../components/dashboard/NextActions";
import { Button } from "../components/ui/button";
import { getMonthlyStats } from "../lib/mockData";
import { StatCard } from "../components/dashboard/StatCard";
import { useDispatch, useSelector } from "react-redux";
import { getSalesforceToken } from "../store/slices/authSlice";
import { getApprovedThisMonth, getCashCollectedAllTime, getFundedData, getPreApprovedThisMonth, getTotalApplications, getTotalApplicationsThisMonth, getTotalApproved, getAllAccounts } from "../store/slices/dashboardSlice";
import { getMonthAndYear } from "../lib/dateUtils";
import { getNewLead } from "../store/slices/applicationSlice";
import { AccountSelect } from "../components/dashboard/AccountSelect";
export function Dashboard({ onNavigate, onNavigateToProgram }) {
  const [fundingProgram, setFundingProgram] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectAllAccounts, setSelectAllAccounts] = useState(false);
  // Get username from session storage
  const username = sessionStorage.getItem("partnerUsername") || "Partner";
  // Generate stats based on selected month using centralized data
  const monthlyStats = useMemo(
    () => getMonthlyStats(selectedDate),
    [selectedDate],
  );

  useEffect(() => {
    //console.log(fundingProgram, 'fundingProgram')
    //console.log(selectedDate, 'selectedDate')

  }, [fundingProgram, selectedDate])

  const { month, year } = getMonthAndYear(selectedDate)
  const dispatch = useDispatch();
  const { salesforceToken, portalUserId } = useSelector((state) => state.auth);
  const {
    totalApproved,
    loanByTypeThisMonth,
    loanByTypeAllTime,
    cashCollectedThisMonth,
    cashCollectedAllTime,
    totalApplications,
    fundedData,
    preApprovedApplicationsThisMonth,
    approvedApplicationsThisMonth,
    totalApplicationsThisMonth,
    allAccounts

  } = useSelector((state) => state.dashboard);
  const {

    newLeads

  } = useSelector((state) => state.application);
  // Fetch all accounts once when token is available
  useEffect(() => {
    if (!salesforceToken) {
      dispatch(getSalesforceToken());
    } else {
      dispatch(getAllAccounts({ token: salesforceToken }));
    }
  }, [dispatch, salesforceToken]);

  // Sync selectAllAccounts with selectedAccounts to ensure consistency
  useEffect(() => {
    if (allAccounts.length > 0) {
      const shouldBeAllSelected = selectedAccounts.length === allAccounts.length;
      if (selectAllAccounts !== shouldBeAllSelected) {
        setSelectAllAccounts(shouldBeAllSelected);
      }
    }
  }, [selectedAccounts, allAccounts, selectAllAccounts]);

  // Compute accountId for passing to child components
  const accountId = selectAllAccounts || selectedAccounts.length === 0
    ? allAccounts.map(acc => acc.Id).join(',')
    : selectedAccounts.join(',');

  // Fetch dashboard data once allAccounts is loaded (or when filters change)
  useEffect(() => {
    if (!salesforceToken) return;
    if (allAccounts.length === 0) return; // Wait for accounts to load

    // Determine account IDs to use: either specific selection or all accounts
    let accountId = '';
    
    if (selectAllAccounts || selectedAccounts.length === 0) {
      // Use all accounts when Select All is checked or no specific accounts selected
      accountId = allAccounts.map(acc => acc.Id).join(',');
    } else if (selectedAccounts.length > 0) {
      // Use explicitly selected accounts
      accountId = selectedAccounts.join(',');
    } else {
      // Fallback to all accounts
      accountId = allAccounts.map(acc => acc.Id).join(',');
    }

    // Ensure accountId is not empty
    if (!accountId) {
      accountId = allAccounts.map(acc => acc.Id).join(',');
    }

    // Log for debugging
    console.log('Fetching data for:', { accountId, month, year, selectAllAccounts, selectedAccountsLength: selectedAccounts.length, allAccountsLength: allAccounts.length });

    dispatch(getFundedData({ accountId, token: salesforceToken, month: month, year: year }));
    dispatch(getNewLead({ accountId, token: salesforceToken, month: month, year: year }));
    dispatch(getTotalApplicationsThisMonth({ accountId, token: salesforceToken, month: month, year: year }));
    dispatch(getTotalApproved({ accountId, token: salesforceToken, month: month, year: year }));
    dispatch(getPreApprovedThisMonth({ accountId, token: salesforceToken, month: month, year: year }));
    dispatch(getApprovedThisMonth({ accountId, token: salesforceToken, month: month, year: year }));
  }, [dispatch, salesforceToken, selectedDate, selectedAccounts, selectAllAccounts, allAccounts, month, year]);
  //console.log(totalApplicationsThisMonth.length,'totalApplicationsThisMonth')
  const maxCount = newLeads.length + preApprovedApplicationsThisMonth.length + approvedApplicationsThisMonth.length + fundedData.length || 0;

  const totalCashCollected = useMemo(() => {
    return fundedData.reduce((acc, curr) => {
      return acc + (parseFloat(curr.Cash_Collected__c) || 0);
    }, 0);
  }, [fundedData]);
  
  return (
    <div className="p-4 md:p-6 animate-fade-in bg-background">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Partner Dashboard
        </h1>
        {/* <p className="text-sm md:text-base text-muted-foreground">
          Welcome, {totalApproved[0]?.Account_Name__c}!
        </p> */}
      </div>

      {/* Monthly Funding Stats Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
  <h2 className="text-base md:text-lg font-bold text-foreground">
    Monthly Funding Stats
  </h2>

  {/* Filters grouped to the right */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
    {/* Month Filter */}
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 md:h-9 md:w-9 bg-card border-border"
        onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-card border border-border rounded-md">
        <CalendarIcon className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <span className="text-xs md:text-sm font-medium">
          {format(selectedDate, "MMMM yyyy")}
        </span>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 md:h-9 md:w-9 bg-card border-border"
        onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>

    {/* Account Filter */}
    <div className="w-full sm:w-48">
      <AccountSelect
        accounts={allAccounts}
        selectedAccounts={selectedAccounts}
        onChange={(accounts) => {
          setSelectedAccounts(accounts);
        }}
        onSelectAllChange={(isAllSelected) => {
          setSelectAllAccounts(isAllSelected);
        }}
      />
    </div>
  </div>
</div>

      {/* Stats Row - Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard
          title="Application This Month"
          value={totalApplicationsThisMonth.length}
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Approved Loans"
          value={approvedApplicationsThisMonth.length}
          // value={monthlyStats.approved + monthlyStats.funded} 
          icon={CheckCircle2}
          variant="info"
        />
        <StatCard
          title="Approval Rate"
          value={
    totalApplicationsThisMonth.length > 0 
      ? `${Math.round((approvedApplicationsThisMonth.length / totalApplicationsThisMonth.length) * 100)}%` 
      : "0%"
  }
          icon={Percent}
          variant="light-blue"
        />
        <StatCard
          title="Funded Rate"
         value={
    approvedApplicationsThisMonth?.length > 0 
      ? `${Math.round((fundedData.length / approvedApplicationsThisMonth.length) * 100)}%` 
      : "0%"
  }
          icon={Percent}
          variant="light-blue"
        />
        <StatCard
          title="Total Funded"
          value={'$' + totalCashCollected.toLocaleString()}
          icon={DollarSign}
          variant="success"
        />
      </div>

      {/* Charts Row - Deal Pipeline & Funding Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DealPipelineChart selectedDate={selectedDate} accountId={accountId} />
        <FundingVolumeChart selectedDate={selectedDate} accountId={accountId} />
      </div>

      {/* Funding by Program Chart + Earnings Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <FundingByProgramChart selectedDate={selectedDate} accountId={accountId} />
          <FundingProgramSelect
            value={fundingProgram}
            onChange={setFundingProgram}
            onNavigateToDetails={onNavigateToProgram}
          />
        </div>
        <EarningsForecast selectedDate={selectedDate} accountId={accountId} />
      </div>

      {/* Bottom Row - Table and Actions Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReferralsTable
            onViewAll={() => onNavigate("report")}
            selectedDate={selectedDate}
            accountId={accountId}
          />
        </div>
        <div className="space-y-4">
          <NextActions
            onSubmitReferral={() => onNavigate("submit")}
            onContactSupport={() => { }}
          />
        </div>
      </div>
    </div>
  );
}
