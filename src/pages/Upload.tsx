import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, Download, CheckCircle2, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { parseExcelFile, generateExcelTemplate, FinancialData } from "@/lib/excel-utils";
import { useToast } from "@/hooks/use-toast";

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
];

// Validate file before processing
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.` 
    };
  }

  // Check file size is not zero (corrupted)
  if (file.size === 0) {
    return { valid: false, error: 'File appears to be empty or corrupted.' };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return { 
      valid: false, 
      error: `Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.` 
    };
  }

  // Check MIME type (with fallback for CSV which can have various MIME types)
  const isValidMime = ALLOWED_MIME_TYPES.includes(file.type) || 
    (fileName.endsWith('.csv') && (file.type === '' || file.type.includes('text')));
  
  if (!isValidMime && file.type !== '') {
    return { 
      valid: false, 
      error: `File type mismatch. The file extension doesn't match its content type.` 
    };
  }

  return { valid: true };
};

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validation = validateFile(selectedFile);
      
      if (!validation.valid) {
        setFileError(validation.error || 'Invalid file');
        setFile(null);
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
      } else {
        setFileError(null);
        setFile(selectedFile);
        setSuccess(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validation = validateFile(droppedFile);
      
      if (!validation.valid) {
        setFileError(validation.error || 'Invalid file');
        setFile(null);
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
      } else {
        setFileError(null);
        setFile(droppedFile);
        setSuccess(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUseSampleData = () => {
    const sampleData: FinancialData[] = [
      {
        date: '2024-01-01',
        revenue: 50000,
        operatingExpenses: 30000,
        customerCount: 100,
        churnRate: 5,
        cashIn: 55000,
        cashOut: 35000,
        cashBalance: 200000,
      },
      {
        date: '2024-02-01',
        revenue: 55000,
        operatingExpenses: 32000,
        customerCount: 110,
        churnRate: 4.5,
        cashIn: 60000,
        cashOut: 37000,
        cashBalance: 223000,
      },
      {
        date: '2024-03-01',
        revenue: 60000,
        operatingExpenses: 35000,
        customerCount: 120,
        churnRate: 4,
        cashIn: 65000,
        cashOut: 40000,
        cashBalance: 248000,
      },
      {
        date: '2024-04-01',
        revenue: 68000,
        operatingExpenses: 38000,
        customerCount: 132,
        churnRate: 3.8,
        cashIn: 72000,
        cashOut: 43000,
        cashBalance: 277000,
      },
      {
        date: '2024-05-01',
        revenue: 75000,
        operatingExpenses: 42000,
        customerCount: 145,
        churnRate: 3.5,
        cashIn: 80000,
        cashOut: 47000,
        cashBalance: 310000,
      },
      {
        date: '2024-06-01',
        revenue: 85000,
        operatingExpenses: 45000,
        customerCount: 160,
        churnRate: 3.2,
        cashIn: 90000,
        cashOut: 52000,
        cashBalance: 348000,
      },
    ];

    sessionStorage.setItem('financialData', JSON.stringify(sampleData));
    
    toast({
      title: "Sample data loaded",
      description: "Redirecting to dashboard with sample data...",
    });

    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const data = await parseExcelFile(file);
      
      // Store data in sessionStorage
      sessionStorage.setItem('financialData', JSON.stringify(data));
      
      setSuccess(true);
      toast({
        title: "File uploaded successfully",
        description: "Processing your financial data...",
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Upload Your Financial Data
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Transform your spreadsheet into investor-ready insights in seconds
            </p>
            <Button
              onClick={handleUseSampleData}
              variant="outline"
              className="border-foreground/30 hover:bg-foreground hover:text-background"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Try with Sample Data
            </Button>
          </div>

          {/* Download Template */}
          <div className="bg-card border border-border rounded p-6 mb-8">
            <div className="flex items-start space-x-4">
              <Download className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Step 1: Download Template</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started with our pre-formatted Excel template. Fill in your monthly data including revenue, expenses, customers, and cash flow.
                </p>
                <Button 
                  onClick={generateExcelTemplate}
                  variant="outline"
                  className="border-foreground/20 hover:bg-foreground hover:text-background"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-card border border-border rounded p-6">
            <div className="flex items-start space-x-4 mb-6">
              <UploadIcon className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Step 2: Upload Your Data</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your completed Excel file. We'll validate and process it instantly.
                </p>
              </div>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-border rounded p-12 text-center hover:border-foreground/40 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {success ? (
                  <div className="flex flex-col items-center space-y-3">
                    <CheckCircle2 className="h-12 w-12 text-success" />
                    <div>
                      <p className="font-semibold">File uploaded successfully</p>
                      <p className="text-sm text-muted-foreground mt-1">{file?.name}</p>
                    </div>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center space-y-3">
                    <UploadIcon className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">Click to change file</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <UploadIcon className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Drop your Excel file here</p>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {fileError && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">File validation failed</p>
                  <p className="text-sm text-destructive/80 mt-1">{fileError}</p>
                </div>
              </div>
            )}

            {file && !success && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  {uploading ? "Processing..." : "Continue to Dashboard"}
                </Button>
              </div>
            )}

            {success && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  View Dashboard
                </Button>
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="mt-8 text-sm text-muted-foreground">
            <p className="font-medium mb-2">File Requirements:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Excel format (.xlsx, .xls) or CSV</li>
              <li>Must include columns: Date, Revenue, Operating Expenses, Customer Count</li>
              <li>Optional: Churn Rate, Cash In, Cash Out, Cash Balance</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
