import React, { useState } from "react";
import { Button, Dialog, DialogTitle, TextField } from "@mui/material";
import StatsCard from "../components/StatsCard.jsx";
const Transactions1 = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-stretch justify-center flex-col sm:flex-row align-middle gap-4 mt-3 px-4 max-w-4xl mx-auto">
        <StatsCard title="Account Balance" value="$12,450.75" />
        <StatsCard title="Monthly Spending" value="-$1,800.50" />
      </div>
      <div className="bg-amber-950 flex items-center justify-end mt-4 p-2">
        <button
          onClick={() => setOpen(true)}
          className="bg-amber-300 hover:bg-amber-400 text-white font-semibold py-2 px-4 rounded "
        >
          Add Transaction
        </button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="p-6 bg-yellow-100 text-red-500 ">
          <DialogTitle>Add New Transaction</DialogTitle>
          <TextField className="w-100" label="Amount" name="name" />
          <TextField className="w-100" label="Date" />
          <TextField className="w-100 mt-4" label="Description" />
          <Button> ADD </Button>
        </div>
      </Dialog>
    </div>
  );
};
export default Transactions1;
