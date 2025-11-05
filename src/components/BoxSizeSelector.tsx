import Slider from "@mui/material/Slider";

interface Props {
  BoxSize: number;
  setBoxSize: (value: number) => void;
}
const BoxSizeSelector: React.FC<Props> = ({ BoxSize, setBoxSize }) => {
  return (
    <div className="flex flex-col w-30">
      <Slider
        size="medium"
        value={BoxSize}
        onChange={(_, newValue) => setBoxSize(newValue as number)}
        min={0}
        max={1}
        step={0.01}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => {
          if (value == 1) return "Realistic scale";
          if (value == 0) return "Unified scale";
          else return value.toFixed(2);
        }}
      />
    </div>
  );
};

export default BoxSizeSelector;
