import {
  CropIcon,
  ResetIcon,
  RotateCounterClockwiseIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons";
import { FlipHorizontalIcon, FlipVerticalIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

interface ToolbarProps {
  onRotate?: (angle: number) => void;
  onFlip?: (horizontal: boolean, vertical: boolean) => void;
  onReset?: () => void;
  changed?: boolean;
  className?: string;
  disabled?: unknown;
}

export const Toolbar: FC<ToolbarProps> = ({
  className,
  disabled,
  changed,
  onReset,
  onRotate,
  onFlip,
}) => {
  const rotateLeft = () => {
    if (onRotate && !disabled) {
      onRotate(-90);
    }
  };

  const rotateRight = () => {
    if (onRotate && !disabled) {
      onRotate(90);
    }
  };

  const flipHorizontal = () => {
    if (onFlip && !disabled) {
      onFlip(true, false);
    }
  };

  const flipVertical = () => {
    if (onFlip && !disabled) {
      onFlip(false, true);
    }
  };

  return (
    <div
      className={cn(
        "bg-inherit border-t border-[#171616] items-center h-[64px] flex justify-center",
        className
      )}
    >
      <button
        className="cursor-pointer w-[80px] h-full hover:scale-110 flex items-center justify-center bg-none outline-none p-0 transition-transform duration-500 fill-white border-r border-[#171616]"
        onClick={flipHorizontal}
      >
        {/* flip around z origin */}
        <FlipHorizontalIcon className="h-5 w-5 text-white" />
      </button>
      <button
        className="cursor-pointer w-[80px] h-full hover:scale-110 flex items-center justify-center bg-none outline-none transition-transform duration-500 fill-white border-r border-[#171616]"
        onClick={rotateRight}
      >
        <RotateCounterClockwiseIcon className="h-5 w-5 text-white" />
      </button>

      <div className="w-[80px] flex items-center justify-center relative">
        <div
          className={cn(
            "default-cropper-navigation__dot size-[6px] bg-[#393939] rounded-full scale-100 transition-transform duration-500",
            changed && "transform scale-0"
          )}
        />

        <button
          className={cn(
            (className =
              "hover:-translate-1/2 delay-75 hover:scale-100 absolute top-[50%] left-[50%] cursor-pointer w-[80px] h-full flex items-center justify-center bg-none outline-none transition-transform duration-500 fill-white border-r border-[#171616]"),
            !changed && "delay-0 hover:scale-110 hover:-translate-0"
          )}
          onClick={onReset}
        >
          <ResetIcon />
        </button>
      </div>
      <button
        className="cursor-pointer w-[80px] h-full hover:scale-110 flex items-center justify-center bg-none outline-none transition-transform duration-500 fill-white border-r border-[#171616]"
        onClick={rotateLeft}
      >
        <RotateCounterClockwiseIcon className="h-5 w-5 text-white" />
      </button>
      <button
        className="cursor-pointer w-[80px] h-full hover:scale-110 flex items-center justify-center bg-none outline-none transition-transform duration-500 fill-white border-r border-[#171616]"
        onClick={flipVertical}
      >
        <FlipVerticalIcon className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};

function Experiment({
  changed,
  className,
  disabled,
  onFlip,
  onReset,
  onRotate,
}: ToolbarProps) {
  const rotateLeft = () => {
    if (onRotate && !disabled) {
      onRotate(-90);
    }
  };

  const flipHorizontal = () => {
    if (onFlip && !disabled) {
      onFlip(true, false);
    }
  };

  const flipVertical = () => {
    if (onFlip && !disabled) {
      onFlip(false, true);
    }
  };

  const reset = () => {
    if (onReset && !disabled) {
      onReset();
    }
  };

  const zoomIn = () => {
    return null;
  };

  const zoomOut = () => {
    return null;
  };

  const crop = () => {
    return null;
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <ToolbarButton
          onClick={rotateLeft}
          tooltip="Rotate right"
          icon={<RotateCounterClockwiseIcon className="h-4 w-4" />}
        />

        {/* zoom out */}
        <ToolbarButton
          onClick={zoomOut}
          tooltip="Zoom out"
          icon={<ZoomOutIcon className="h-4 w-4" />}
        />

        {/* zoom in */}
        <ToolbarButton
          onClick={zoomIn}
          tooltip="Zoom in"
          icon={<ZoomInIcon className="h-4 w-4" />}
        />

        {/* crop */}
        <ToolbarButton
          onClick={crop}
          tooltip="Crop"
          icon={<CropIcon className="h-4 w-4" />}
        />

        {/* flip horizontal */}
        <ToolbarButton
          onClick={flipHorizontal}
          tooltip="Flip horizontal"
          icon={<FlipHorizontalIcon className="h-4 w-4" />}
        />

        {/* flip vertical */}
        <ToolbarButton
          onClick={flipVertical}
          tooltip="Flip vertical"
          icon={<FlipVerticalIcon className="h-4 w-4" />}
        />

        {/* reset */}
        <Separator orientation="vertical" />
        <ToolbarButton
          onClick={reset}
          tooltip="Reset"
          icon={<ResetIcon className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}

type ToolbarButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
};

function ToolbarButton({ icon: Icon, onClick, tooltip }: ToolbarButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" onClick={onClick} variant="outline" size="icon">
            {Icon}
            <span className="sr-only">{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
