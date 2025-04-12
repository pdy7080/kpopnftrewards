# qr_generator.py
import qrcode
import json
import os
from datetime import datetime
from typing import Dict, Optional

class QRGenerator:
    def __init__(self):
        # 아티스트 정보
        self.artists: Dict[str, Dict[str, str]] = {
            'gidle': {
                'name': '여자아이들',
                'members': {
                    'miyeon': '미연',
                    'soyeon': '소연',
                    'yuqi': '우기',
                    'shuhua': '슈화',
                    'minnie': '민니'
                },
                'group': '여자아이들'
            },
            'bibi': {
                'name': '비비',
                'members': {
                    'bibi': '비비'
                },
                'group': '비비'
            },
            'chanwon': {
                'name': '이찬원',
                'members': {
                    'chanwon': '이찬원'
                },
                'group': '이찬원'
            }
        }
        
        # 기본 이벤트 정보 (기념굿즈 구매)
        self.default_event = {
            'id': 'event4',
            'name': '기념굿즈구매',
            'description_template_member': '{artist_name} {event_name}을 기념하는 특별 기념주화 NFT입니다. {member_name} 멤버의 특별한 디자인이 적용되었습니다. {event_name}의 특별한 순간을 담아낸 한정판 주화입니다.',
            'description_template_group': '{group_name} {event_name}을 기념하는 플래티넘 기념주화 NFT입니다. 그룹 전체의 특별한 디자인이 적용되었습니다. {event_name}의 특별한 순간을 담아낸 한정판 주화입니다.',
            'title_template_member': '{artist_name} {member_name} {event_name} 기념 주화 NFT',
            'title_template_group': '{group_name} {event_name} 기념 플래티넘 주화 NFT'
        }
        
        # QR 코드 저장 디렉토리
        self.qr_dir = 'generated_qrs'
        os.makedirs(self.qr_dir, exist_ok=True)

    def generate_nft_content(self, artist_id: str, member_id: Optional[str] = None, custom_title: str = None) -> Dict[str, str]:
        """
        NFT 제목과 내용을 생성합니다.
        """
        artist_info = self.artists[artist_id]
        artist_name = artist_info['name']
        group_name = artist_info['group']
        event_name = self.default_event['name']
        
        # 제목 생성 (사용자 입력 또는 자동 생성)
        if custom_title:
            title = custom_title
        else:
            if member_id:
                member_name = artist_info['members'][member_id]
                title = self.default_event['title_template_member'].format(
                    artist_name=artist_name,
                    member_name=member_name,
                    event_name=event_name
                )
            else:
                title = self.default_event['title_template_group'].format(
                    group_name=group_name,
                    event_name=event_name
                )
        
        # 설명 생성
        if member_id:
            member_name = artist_info['members'][member_id]
            description = self.default_event['description_template_member'].format(
                artist_name=artist_name,
                event_name=event_name,
                member_name=member_name
            )
        else:
            description = self.default_event['description_template_group'].format(
                group_name=group_name,
                event_name=event_name
            )
        
        return {
            "title": title,
            "description": description
        }

    def generate_qr(self, artist_id: str, member_id: Optional[str], purchase_order: int, custom_title: str = None) -> str:
        """
        QR 코드를 생성하고 저장합니다.
        """
        try:
            # NFT 내용 생성
            nft_content = self.generate_nft_content(artist_id, member_id, custom_title)
            
            # QR 코드 데이터 구조 - 앱의 기존 로직과 일치
            qr_data = {
                "type": "nft",
                "tier": "fan",  # 항상 fan 티어로 시작
                "artistId": artist_id,
                "eventId": self.default_event['id'],
                "purchaseOrder": purchase_order,
                "title": nft_content["title"],
                "description": nft_content["description"],
                "createdAt": datetime.now().isoformat(),
                "isGroupNFT": member_id is None  # 그룹 NFT 여부를 명시적으로 표시
            }
            
            # 멤버 ID가 있는 경우에만 추가
            if member_id:
                qr_data["memberId"] = member_id

            # QR 코드 생성
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(json.dumps(qr_data))
            qr.make(fit=True)

            # QR 코드 이미지 생성
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # 파일명 생성
            filename = f"qr_{artist_id}_{self.default_event['id']}_{purchase_order}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            if member_id:
                filename = f"qr_{artist_id}_{member_id}_{self.default_event['id']}_{purchase_order}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            save_path = os.path.join(self.qr_dir, filename)
            
            # QR 코드 저장
            qr_image.save(save_path)
            return save_path, nft_content
            
        except Exception as e:
            print(f"QR 코드 생성 중 오류 발생: {str(e)}")
            raise

    def validate_input(self, artist_id: str, member_id: Optional[str], quantity: int) -> bool:
        """
        입력값의 유효성을 검사합니다.
        """
        if artist_id not in self.artists:
            print(f"잘못된 아티스트 ID입니다: {artist_id}")
            return False
            
        if member_id and member_id not in self.artists[artist_id]['members']:
            print(f"잘못된 멤버 ID입니다: {member_id}")
            return False
            
        if quantity <= 0:
            print("발행 수량은 1개 이상이어야 합니다.")
            return False
            
        return True

def main():
    generator = QRGenerator()
    
    while True:
        try:
            print("\n=== QR 코드 생성기 ===")
            print("1. QR 코드 생성")
            print("2. 종료")
            
            choice = input("선택하세요: ").strip()
            
            if choice == "1":
                # 아티스트 선택
                print("\n=== 아티스트 선택 ===")
                for idx, (artist_id, artist_info) in enumerate(generator.artists.items(), 1):
                    print(f"{idx}. {artist_info['name']}")
                
                try:
                    artist_choice = int(input("아티스트 번호를 선택하세요: ").strip())
                    if not 1 <= artist_choice <= len(generator.artists):
                        raise ValueError("잘못된 번호입니다.")
                    artist_id = list(generator.artists.keys())[artist_choice - 1]
                except ValueError as e:
                    print(f"오류: {str(e)}")
                    continue
                
                # 발행 대상 선택
                print("\n=== 발행 대상 선택 ===")
                print("1. 그룹 전체")
                print("2. 개별 멤버")
                target_choice = input("선택하세요: ").strip()
                
                member_id = None
                if target_choice == "2":
                    # 멤버 선택
                    print("\n=== 멤버 선택 ===")
                    for idx, (member_id, member_name) in enumerate(generator.artists[artist_id]['members'].items(), 1):
                        print(f"{idx}. {member_name}")
                    
                    try:
                        member_choice = int(input("멤버 번호를 선택하세요: ").strip())
                        if not 1 <= member_choice <= len(generator.artists[artist_id]['members']):
                            raise ValueError("잘못된 번호입니다.")
                        member_id = list(generator.artists[artist_id]['members'].keys())[member_choice - 1]
                    except ValueError as e:
                        print(f"오류: {str(e)}")
                        continue
                
                # NFT 제목 설정
                print("\n=== NFT 제목 설정 ===")
                print("1. 자동 생성")
                print("2. 직접 입력")
                title_choice = input("선택하세요: ").strip()
                
                custom_title = None
                if title_choice == "2":
                    custom_title = input("NFT 제목을 입력하세요: ").strip()
                
                # 발행 수량 입력
                try:
                    quantity = int(input("발행할 QR 코드 수량을 입력하세요: ").strip())
                    if quantity <= 0:
                        raise ValueError("발행 수량은 1개 이상이어야 합니다.")
                except ValueError as e:
                    print(f"오류: {str(e)}")
                    continue
                
                # 입력값 검증
                if not generator.validate_input(artist_id, member_id, quantity):
                    continue
                
                # QR 코드 생성
                try:
                    print(f"\n{quantity}개의 QR 코드를 생성합니다...")
                    
                    # 첫 번째 QR 코드의 NFT 내용 미리 보기
                    _, nft_content = generator.generate_qr(artist_id, member_id, 1, custom_title)
                    print("\n=== 생성될 NFT 내용 ===")
                    print(f"제목: {nft_content['title']}")
                    print(f"설명: {nft_content['description']}")
                    print("=====================")
                    
                    # 모든 QR 코드 생성
                    for i in range(1, quantity + 1):
                        save_path, _ = generator.generate_qr(artist_id, member_id, i, custom_title)
                        print(f"QR 코드 {i}/{quantity} 생성 완료: {save_path}")
                    
                    print(f"\n모든 QR 코드가 생성되었습니다.")
                    print(f"아티스트: {generator.artists[artist_id]['name']}")
                    if member_id:
                        print(f"멤버: {generator.artists[artist_id]['members'][member_id]}")
                    else:
                        print(f"발행 대상: 그룹 전체")
                    print(f"이벤트: {generator.default_event['name']}")
                    print(f"발행 수량: {quantity}")
                except Exception as e:
                    print(f"QR 코드 생성 중 오류 발생: {str(e)}")
                    continue
                
            elif choice == "2":
                print("프로그램을 종료합니다.")
                break
            
            else:
                print("잘못된 선택입니다. 다시 선택해주세요.")
                
        except Exception as e:
            print(f"예상치 못한 오류 발생: {str(e)}")
            continue

if __name__ == "__main__":
    main()