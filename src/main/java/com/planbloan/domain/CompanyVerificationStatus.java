package com.planbloan.domain;

public enum CompanyVerificationStatus {
    /** 본사가 계정만 발급, 업체가 아직 정보를 입력하지 않음 */
    PENDING_INFO,
    /** 업체가 정보 입력 후 승인 요청함 */
    PENDING_APPROVAL,
    APPROVED,
    REJECTED
}
