import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { parseExcelFile, generateExcelTemplate, FinancialData } from "@/lib/excel-utils";
import { useToast } from "@/hooks/use-toast";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setSuccess(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
            <p className="text-lg text-muted-foreground">
              Transform your spreadsheet into investor-ready insights in seconds
            </p>
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
