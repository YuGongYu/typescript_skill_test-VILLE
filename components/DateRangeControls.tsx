import { SeriesBounds } from "../lib/types";
import type { FC } from "react";

type Props = {
  startDate: string | undefined;
  endDate: string | undefined;
  seriesBounds: SeriesBounds;
  onStartChange: (value: string | undefined) => void;
  onEndChange: (value: string | undefined) => void;
};

const DateRangeControls: FC<Props> = ({ startDate, endDate, seriesBounds, onStartChange, onEndChange }) => {
  return (
    <div className="bg-inderes-lavender rounded-lg p-6 mb-6">
      <h3 className="mb-2">Date Range Filter</h3>
      <p className="m-0 mb-3 text-inderes-gray">
        Pick a start and end date to filter all sections on this page. All charts and tables update to reflect
        the selected period.
      </p>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="globalStart" className="text-inderes-gray font-medium">Start:</label>
          <input
            id="globalStart"
            type="date"
            className="border border-inderes-border-gray bg-white text-gray-900 rounded-md px-3 py-2"
            value={startDate ?? seriesBounds.min ?? ''}
            min={seriesBounds.min}
            max={endDate ?? seriesBounds.max}
            onChange={(e) => onStartChange(e.target.value || undefined)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="globalEnd" className="text-inderes-gray font-medium">End:</label>
          <input
            id="globalEnd"
            type="date"
            className="border border-inderes-border-gray bg-white text-gray-900 rounded-md px-3 py-2"
            value={endDate ?? seriesBounds.max ?? ''}
            min={startDate ?? seriesBounds.min}
            max={seriesBounds.max}
            onChange={(e) => onEndChange(e.target.value || undefined)}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeControls;


