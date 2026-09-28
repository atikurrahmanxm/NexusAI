import { 
  PostureFinding, 
  ComplianceScore, 
  CspmSummary 
} from '../types/cspm';

export const INITIAL_CSPM_FINDINGS: PostureFinding[] = [
  {
    id: 'cspm-aws-01',
    title: 'S3 Bucket with Public Access Block Disabled',
    description: 'S3 bucket allows public object read/write policies, exposing raw forensic telemetry to the open internet.',
    cloudProvider: 'AWS',
    resourceId: 'arn:aws:s3:::corp-nexus-telemetry-vault',
    resourceType: 'S3 Storage Bucket',
    region: 'us-east-1',
    severity: 'CRITICAL',
    status: 'FAILED',
    standards: ['CIS_BENCHMARK', 'PCI_DSS_4', 'SOC_2_TYPE_II'],
    controlId: 'CIS-AWS-2.1.5 / PCI-10.2.1',
    remediationCli: 'aws s3api put-public-access-block --bucket corp-nexus-telemetry-vault --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"',
    remediationTerraform: `resource "aws_s3_bucket_public_access_block" "block_public" {
  bucket                  = "corp-nexus-telemetry-vault"
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`,
    detectedAt: '12:04:18',
    impactScore: 9.8
  },
  {
    id: 'cspm-gcp-02',
    title: 'VPC Firewall Permits Inbound SSH (0.0.0.0/0:22)',
    description: 'Firewall ingress rule permits unrestricted SSH port 22 access from any public IPv4 source address.',
    cloudProvider: 'GCP',
    resourceId: 'projects/nexus-prod/global/firewalls/default-allow-ssh',
    resourceType: 'VPC Ingress Firewall',
    region: 'global',
    severity: 'CRITICAL',
    status: 'FAILED',
    standards: ['CIS_BENCHMARK', 'SOC_2_TYPE_II', 'ISO_27001'],
    controlId: 'CIS-GCP-3.6 / SOC2-CC6.6',
    remediationCli: 'gcloud compute firewall-rules update default-allow-ssh --source-ranges="10.0.0.0/8,172.16.0.0/12" --allow=tcp:22',
    remediationTerraform: `resource "google_compute_firewall" "allow_ssh_bastion_only" {
  name    = "default-allow-ssh"
  network = "nexus-vpc"
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  source_ranges = ["10.240.0.0/16"] # Bastion subnet only
}`,
    detectedAt: '11:48:32',
    impactScore: 9.4
  },
  {
    id: 'cspm-aws-03',
    title: 'Root IAM Account Lacks Hardware MFA Token',
    description: 'The AWS account root user is active without hardware or virtual Multi-Factor Authentication enabled.',
    cloudProvider: 'AWS',
    resourceId: 'arn:aws:iam::884102941:root',
    resourceType: 'IAM Account Identity',
    region: 'global',
    severity: 'HIGH',
    status: 'FAILED',
    standards: ['CIS_BENCHMARK', 'SOC_2_TYPE_II', 'PCI_DSS_4', 'HIPAA'],
    controlId: 'CIS-AWS-1.5 / SOC2-CC6.1',
    remediationCli: 'aws iam create-virtual-mfa-device --virtual-mfa-device-name RootMFADevice --outfile RootQRCode.png --bootstrap-method QRCodePNG',
    remediationTerraform: `# IAM Root MFA cannot be configured via Terraform.
# Enforce IAM policy requiring MFA for all administrative operations:
resource "aws_iam_account_password_policy" "strict" {
  minimum_password_length        = 16
  require_numbers                = true
  require_symbols                = true
  require_uppercase_characters   = true
  max_password_age               = 90
}`,
    detectedAt: '11:15:00',
    impactScore: 8.7
  },
  {
    id: 'cspm-k8s-04',
    title: 'Kubernetes Pod Security: Privileged Container Permitted',
    description: 'Pod specification sets securityContext.privileged=true allowing container escape and node takeover.',
    cloudProvider: 'KUBERNETES',
    resourceId: 'k8s://cluster-alpha/namespaces/prod/pods/ingress-nginx-controller-84',
    resourceType: 'Kubernetes DaemonSet/Pod',
    region: 'us-west-2',
    severity: 'CRITICAL',
    status: 'FAILED',
    standards: ['CIS_BENCHMARK', 'SOC_2_TYPE_II', 'PCI_DSS_4'],
    controlId: 'CIS-K8S-5.2.1 / PCI-6.5.8',
    remediationCli: 'kubectl patch deployment ingress-nginx-controller -n prod -p \'{"spec":{"template":{"spec":{"containers":[{"name":"controller","securityContext":{"privileged":false,"allowPrivilegeEscalation":false}}]}}}}\'',
    remediationTerraform: `security_context {
  privileged                 = false
  allow_privilege_escalation = false
  read_only_root_filesystem  = true
  run_as_non_root            = true
}`,
    detectedAt: '10:55:12',
    impactScore: 9.6
  },
  {
    id: 'cspm-az-05',
    title: 'Azure SQL Database Transparent Data Encryption (TDE) Disabled',
    description: 'Production financial database does not enforce AES-256 transparent data encryption at rest.',
    cloudProvider: 'AZURE',
    resourceId: 'azure://subscriptions/sub-91/resourceGroups/nexus-rg/providers/Microsoft.Sql/servers/fintech-db',
    resourceType: 'Azure SQL Database',
    region: 'eastus',
    severity: 'HIGH',
    status: 'FAILED',
    standards: ['HIPAA', 'PCI_DSS_4', 'SOC_2_TYPE_II'],
    controlId: 'HIPAA-164.312(a)(2)(iv) / PCI-3.4',
    remediationCli: 'az sql db tde set --resource-group nexus-rg --server fintech-db --database master --status Enabled',
    remediationTerraform: `resource "azurerm_mssql_database_extended_auditing_policy" "tde" {
  database_id = azurerm_mssql_database.fintech.id
  # Enforce customer managed encryption key (CMEK)
}`,
    detectedAt: '10:30:45',
    impactScore: 8.5
  },
  {
    id: 'cspm-aws-06',
    title: 'CloudTrail Multi-Region Trail Logging Inactive',
    description: 'CloudTrail trail does not log API management events across all active AWS regions.',
    cloudProvider: 'AWS',
    resourceId: 'arn:aws:cloudtrail:us-east-1:884102941:trail/global-secops-trail',
    resourceType: 'AWS CloudTrail',
    region: 'us-east-1',
    severity: 'MEDIUM',
    status: 'FAILED',
    standards: ['CIS_BENCHMARK', 'SOC_2_TYPE_II', 'ISO_27001'],
    controlId: 'CIS-AWS-3.1 / SOC2-CC7.2',
    remediationCli: 'aws cloudtrail update-trail --name global-secops-trail --is-multi-region-trail --include-global-service-events',
    remediationTerraform: `resource "aws_cloudtrail" "global" {
  name                          = "global-secops-trail"
  s3_bucket_name                = "nexus-cloudtrail-logs"
  is_multi_region_trail         = true
  include_global_service_events = true
  enable_log_file_validation    = true
}`,
    detectedAt: '09:50:20',
    impactScore: 6.8
  },
  {
    id: 'cspm-gcp-07',
    title: 'GCS Bucket Uniform Bucket-Level Access Disabled',
    description: 'Cloud Storage bucket uses granular object ACLs rather than uniform IAM controls.',
    cloudProvider: 'GCP',
    resourceId: 'gs://nexus-unsegmented-logs-bucket',
    resourceType: 'Cloud Storage Bucket',
    region: 'us-central1',
    severity: 'HIGH',
    status: 'FAILED',
    standards: ['CIS_BENCHMARK', 'SOC_2_TYPE_II'],
    controlId: 'CIS-GCP-5.2 / SOC2-CC6.3',
    remediationCli: 'gcloud storage buckets update gs://nexus-unsegmented-logs-bucket --uniform-bucket-level-access',
    remediationTerraform: `resource "google_storage_bucket" "uniform" {
  name                        = "nexus-unsegmented-logs-bucket"
  location                    = "US"
  uniform_bucket_level_access = true
}`,
    detectedAt: '09:12:11',
    impactScore: 7.9
  },
  {
    id: 'cspm-aws-08',
    title: 'PCI-DSS Cardholder Subnet Unsegmented from Development VPC',
    description: 'VPC peering link allows unmonitored lateral route injection between staging and cardholder subnets.',
    cloudProvider: 'AWS',
    resourceId: 'vpc-peering-prod-staging-092',
    resourceType: 'VPC Peering Connection',
    region: 'us-east-1',
    severity: 'HIGH',
    status: 'FAILED',
    standards: ['PCI_DSS_4', 'ISO_27001'],
    controlId: 'PCI-DSS-1.2.1 / ISO-A.13.1.3',
    remediationCli: 'aws ec2 delete-vpc-peering-connection --vpc-peering-connection-id pcx-092bf88102',
    remediationTerraform: `# Remove unsegmented peering resource and apply network firewall rules:
resource "aws_networkfirewall_firewall" "chd_segmentation" {
  name                = "chd-boundary-firewall"
  firewall_policy_arn = aws_networkfirewall_firewall_policy.pci.arn
  vpc_id              = "vpc-prod-chd-01"
}`,
    detectedAt: '08:44:03',
    impactScore: 8.9
  },
  {
    id: 'cspm-az-09',
    title: 'Azure Key Vault Soft-Delete & Purge Protection Disabled',
    description: 'Key Vault lacks purge protection, permitting permanent cryptographic key destruction by compromised credentials.',
    cloudProvider: 'AZURE',
    resourceId: 'azure://vaults/nexus-master-vault',
    resourceType: 'Azure Key Vault',
    region: 'eastus2',
    severity: 'MEDIUM',
    status: 'FAILED',
    standards: ['HIPAA', 'SOC_2_TYPE_II'],
    controlId: 'HIPAA-164.312(c)(1) / SOC2-CC6.7',
    remediationCli: 'az keyvault update --name nexus-master-vault --enable-purge-protection true',
    remediationTerraform: `resource "azurerm_key_vault" "vault" {
  name                       = "nexus-master-vault"
  purge_protection_enabled   = true
  soft_delete_retention_days = 90
}`,
    detectedAt: '08:10:55',
    impactScore: 6.2
  },
  {
    id: 'cspm-aws-10',
    title: 'Amazon RDS Aurora Storage Volume KMS Encryption Enabled',
    description: 'Database storage cluster is encrypted at rest with AWS KMS Customer Managed Keys (CMEK).',
    cloudProvider: 'AWS',
    resourceId: 'arn:aws:rds:us-east-1:884102941:cluster:aurora-security-db',
    resourceType: 'RDS Aurora Cluster',
    region: 'us-east-1',
    severity: 'LOW',
    status: 'PASSED',
    standards: ['CIS_BENCHMARK', 'HIPAA', 'PCI_DSS_4', 'SOC_2_TYPE_II'],
    controlId: 'CIS-AWS-2.3.1 / PCI-3.4',
    remediationCli: '# Compliant - No remediation required',
    remediationTerraform: `# Verified Compliant
storage_encrypted = true
kms_key_id        = "arn:aws:kms:us-east-1:884102941:key/nexus-cmek"`,
    detectedAt: '07:30:19',
    impactScore: 1.0
  },
  {
    id: 'cspm-gcp-11',
    title: 'Compute Engine Shielded VM & Secure Boot Active',
    description: 'Virtual machines run with UEFI firmware, vTPM validation, and integrity monitoring enabled.',
    cloudProvider: 'GCP',
    resourceId: 'projects/nexus-prod/zones/us-central1-a/instances/edge-sensor-node',
    resourceType: 'Compute Engine Instance',
    region: 'us-central1',
    severity: 'LOW',
    status: 'PASSED',
    standards: ['CIS_BENCHMARK', 'SOC_2_TYPE_II', 'ISO_27001'],
    controlId: 'CIS-GCP-4.1 / SOC2-CC6.8',
    remediationCli: '# Compliant - No remediation required',
    remediationTerraform: `# Verified Compliant
shielded_instance_config {
  enable_secure_boot          = true
  enable_vtpm                 = true
  enable_integrity_monitoring = true
}`,
    detectedAt: '07:15:40',
    impactScore: 1.0
  }
];

const LOCAL_STORAGE_KEY = 'nexus_cspm_findings_v1';

export function loadCspmFindings(): PostureFinding[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Storage quota or format fallback
  }
  return INITIAL_CSPM_FINDINGS;
}

export function saveCspmFindings(findings: PostureFinding[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(findings));
  } catch {
    // Storage error ignore
  }
}

export function calculateComplianceScores(findings: PostureFinding[]): ComplianceScore[] {
  const standardsMeta: { standard: ComplianceScore['standard']; label: string; badgeColor: string }[] = [
    { standard: 'CIS_BENCHMARK', label: 'CIS Benchmarks v8', badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { standard: 'SOC_2_TYPE_II', label: 'SOC 2 Type II', badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    { standard: 'PCI_DSS_4', label: 'PCI-DSS v4.0', badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { standard: 'HIPAA', label: 'HIPAA Security Rule', badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { standard: 'ISO_27001', label: 'ISO/IEC 27001:2022', badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
  ];

  return standardsMeta.map(({ standard, label, badgeColor }) => {
    const relevant = findings.filter(f => f.standards.includes(standard));
    const total = relevant.length;
    if (total === 0) {
      return { standard, label, score: 100, totalControls: 0, passedControls: 0, failedControls: 0, badgeColor };
    }
    const passed = relevant.filter(f => f.status === 'PASSED' || f.status === 'REMEDIATED').length;
    const failed = total - passed;
    const score = Math.round((passed / total) * 100);

    return {
      standard,
      label,
      score,
      totalControls: total,
      passedControls: passed,
      failedControls: failed,
      badgeColor
    };
  });
}

export function calculateCspmSummary(findings: PostureFinding[]): CspmSummary {
  const total = findings.length;
  const critical = findings.filter(f => f.severity === 'CRITICAL' && f.status === 'FAILED').length;
  const high = findings.filter(f => f.severity === 'HIGH' && f.status === 'FAILED').length;
  const remediated = findings.filter(f => f.status === 'REMEDIATED').length;
  const passed = findings.filter(f => f.status === 'PASSED').length;

  const passedOrRemediated = passed + remediated;
  const overallHealthScore = total > 0 ? Math.round((passedOrRemediated / total) * 100) : 100;
  const complianceScores = calculateComplianceScores(findings);

  return {
    overallHealthScore,
    totalAssetsAudited: total + 37, // audited assets across multi-cloud
    criticalMisconfigs: critical,
    highMisconfigs: high,
    remediatedCount: remediated,
    passedCount: passed,
    complianceScores
  };
}

export function remediateFinding(findings: PostureFinding[], id: string): PostureFinding[] {
  const updated = findings.map(f => {
    if (f.id === id) {
      return {
        ...f,
        status: 'REMEDIATED' as const
      };
    }
    return f;
  });
  saveCspmFindings(updated);
  return updated;
}
